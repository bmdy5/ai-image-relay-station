from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse, RedirectResponse
from sqlalchemy.orm import Session
import httpx
import os
import uuid
import datetime
import time

from backend.models.database import get_db, session_scope
from backend.core.utils import PRICING
from backend.api.auth import get_current_user
from backend.crud import image as image_crud
from backend.schemas import image as image_schema
from ..models import models
from backend.core.cos import upload_base64_to_cos, upload_url_to_cos
from backend.core.config import get_config

router = APIRouter(prefix="/image", tags=["image"])

from starlette.concurrency import run_in_threadpool

async def process_image_task(log_id: int, prompt: str, quality: str, cost: int, user_id: int, request_start_time: float):
    """
    后台任务：真正的画图、转存和结算逻辑
    重构：使用 session_scope 强制管理连接生命周期
    """
    api_key = get_config("OPENAI_API_KEY")
    base_url = get_config("OPENAI_BASE_URL", "https://api.openai.com/v1")
    
    max_retries = 2
    retry_count = 0
    success = False
    error_msg = ""
    final_url = ""
    ai_gen_time = 0
    cos_store_time = 0

    while retry_count <= max_retries and not success:
        try:
            # 1. 更新状态为“生成中”
            with session_scope() as db:
                log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
                if log:
                    log.status = "generating"

            # 2. 调用 AI 接口
            ai_start = time.time()
            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(
                    f"{base_url}/images/generations",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "model": "gpt-image-2", 
                        "prompt": prompt,
                        "n": 1,
                        "size": "1024x1024",
                        "response_format": "url" 
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"API 报错: {response.text}")
                
                res_json = response.json()
                image_url = ""
                raw_data = ""
                
                if "data" in res_json and len(res_json["data"]) > 0:
                    item = res_json["data"][0]
                    if "b64_json" in item:
                        raw_data = item["b64_json"]
                    elif "url" in item:
                        image_url = item["url"]
                elif "images" in res_json and len(res_json["images"]) > 0:
                    image_url = res_json["images"][0]

                if not raw_data and not image_url:
                    raise Exception("无法从 API 响应中提取图片")
                ai_gen_time = time.time() - ai_start

                # 3. 更新状态为“转存中”
                with session_scope() as db:
                    log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
                    if log:
                        log.status = "storing"

                # 4. 转存到 COS
                cos_start = time.time()
                # 提取提示词前 10 个字符并清理非法字符作为文件名
                safe_prompt = "".join([c for c in prompt[:10] if c.isalnum()]).strip() or "image"
                filename = f"user_{user_id}_{safe_prompt}_{uuid.uuid4().hex[:8]}.png"
                
                if raw_data:
                    final_url = await run_in_threadpool(upload_base64_to_cos, raw_data, filename)
                else:
                    if image_url.startswith("data:image"):
                        final_url = await run_in_threadpool(upload_base64_to_cos, image_url, filename)
                    else:
                        final_url = await run_in_threadpool(upload_url_to_cos, image_url, filename)
                cos_store_time = time.time() - cos_start
                
                success = True
        except Exception as e:
            retry_count += 1
            error_msg = str(e)
            if retry_count <= max_retries:
                print(f"Retry {retry_count}/{max_retries} due to: {error_msg}")
                import asyncio
                await asyncio.sleep(2)

    # 5. 最终结算
    with session_scope() as db:
        log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
        user = db.query(models.User).filter(models.User.id == user_id).first()
        
        if not log or not user:
            return

        if success:
            log.status = "success"
            log.image_url = final_url
            user.frozen_points = max(0, user.frozen_points - cost)
        else:
            log.status = "failed"
            log.error_msg = error_msg
            # 失败返还：从冻结中扣除并加回到可用
            user.points += cost
            user.frozen_points = max(0, user.frozen_points - cost)

    # 6. 性能日志打印
    total_time = time.time() - request_start_time
    overhead = total_time - ai_gen_time - cos_store_time
    print(f"\n--- [Performance Report] Visionary | 用户:{user_id} | 提示词:{prompt[:15]}... ---")
    print(f"Log ID: {log_id}")
    print(f"Total Time: {total_time:.2f}s")
    print(f"AI Gen Time: {ai_gen_time:.2f}s")
    print(f"COS Store Time: {cos_store_time:.2f}s")
    print(f"System/Queue Overhead: {overhead:.2f}s")
    print(f"-----------------------------------------------------------\n")

@router.post("/generate")
async def generate_image(
    payload: image_schema.ImageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    异步生成图片：锁定积分 -> 秒回 ID -> 后台异步生成
    """
    cost = PRICING.get(payload.quality, 5)
    # 1. 原子性扣费：确保在高并发下积分不会扣成负数 (Task 1.2 增强)
    # 使用 SQL 层的更新过滤 points >= cost，数据库会自动处理并发竞争
    result = db.query(models.User).filter(
        models.User.id == current_user.id,
        models.User.points >= cost
    ).update({
        "points": models.User.points - cost,
        "frozen_points": models.User.frozen_points + cost
    }, synchronize_session=False) # 改为 False，提高并发性能
    
    if result == 0:
        raise HTTPException(status_code=403, detail="余额不足，请前往充值")
    
    # 2. 创建记录
    pending_log = image_crud.create_image_log(
        db, user_id=current_user.id, prompt=payload.prompt,
        quality=payload.quality, cost_points=cost, status="pending"
    )
    db.commit()
    
    # 3. 启动后台任务
    background_tasks.add_task(
        process_image_task, 
        pending_log.id, payload.prompt, payload.quality, cost, current_user.id,
        time.time()
    )
    
    return {
        "id": pending_log.id,
        "status": "pending",
        "message": "任务已提交，AI 正在云端为您创作...",
        "remaining_points": current_user.points,
        "frozen_points": current_user.frozen_points
    }

@router.get("/status/{id}")
async def get_task_status(id: int, db: Session = Depends(get_db)):
    """查询任务状态"""
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
    if not log:
        raise HTTPException(status_code=404, detail="任务不存在")
    return {
        "id": log.id,
        "status": log.status,
        "image_url": log.image_url if log.status == "success" else None,
        "error": log.error_msg if log.status == "failed" else None
    }

@router.get("/batch-status")
async def get_batch_status(ids: str = Query(...), db: Session = Depends(get_db)):
    """批量查询任务状态 (优化性能)"""
    try:
        id_list = [int(i) for i in ids.split(",")]
    except:
        raise HTTPException(status_code=400, detail="无效的 ID 列表")
    
    logs = db.query(models.ImageLog).filter(models.ImageLog.id.in_(id_list)).all()
    return [{
        "id": log.id,
        "status": log.status,
        "image_url": log.image_url if log.status == "success" else None,
        "error": log.error_msg if log.status == "failed" else None
    } for log in logs]

@router.get("/history")
async def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    keyword: str = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logs = image_crud.get_user_image_logs(db, current_user.id, skip=skip, limit=limit, keyword=keyword)
    return [{
        "id": log.id,
        "prompt": log.prompt,
        "quality": log.quality,
        "status": log.status,
        "image_url": log.image_url,
        "created_at": log.created_at
    } for log in logs]

@router.get("/download")
async def download_image(
    id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
    if not log or not log.image_url:
        raise HTTPException(status_code=404, detail="图片不存在")
    
    if log.image_url.startswith("http"):
        return RedirectResponse(url=log.image_url)
    return RedirectResponse(url=f"/api/image/view/{id}")

@router.get("/view/{id}")
async def view_image(id: int, db: Session = Depends(get_db)):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
    if not log or not log.image_url:
        raise HTTPException(status_code=404, detail="图片不存在")
    
    if log.image_url.startswith("http"):
        return RedirectResponse(url=log.image_url)
        
    try:
        import base64
        if log.image_url.startswith("data:image"):
            header, encoded = log.image_url.split(",", 1)
            content = base64.b64decode(encoded)
            return StreamingResponse(content=iter([content]), media_type=header.split(";")[0].split(":")[1])
    except:
        pass
    raise HTTPException(status_code=400, detail="不支持的图片格式")

@router.delete("/{id}")
async def delete_image(
    id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
    if not log:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    if log.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权删除他人作品")
    
    db.delete(log)
    db.commit()
    return {"message": "删除成功"}
