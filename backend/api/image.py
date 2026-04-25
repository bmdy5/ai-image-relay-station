from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse, RedirectResponse
from sqlalchemy.orm import Session
import httpx
import os
import uuid
import datetime

from backend.models.database import get_db
from backend.core.utils import PRICING
from backend.api.auth import get_current_user
from backend.crud import image as image_crud
from backend.schemas import image as image_schema
from ..models import models
from backend.core.cos import upload_base64_to_cos, upload_url_to_cos

router = APIRouter(prefix="/image", tags=["image"])

async def process_image_task(log_id: int, prompt: str, quality: str, cost: int, user_id: int, db_gen):
    """
    后台任务：真正的画图、转存和扣费逻辑
    """
    # 获取一个新的 DB 会话
    db = next(db_gen())
    log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not log or not user:
        return

    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{base_url}/images/generations",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "gpt-image-2", 
                    "prompt": prompt,
                    "n": 1,
                    "size": "1024x1024",
                    "response_format": "url" if "openai.com" in base_url else "url" 
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"API 报错: {response.text}")
            
            res_json = response.json()
            image_url = ""
            raw_data = ""
            
            # 解析结果
            if "data" in res_json and len(res_json["data"]) > 0:
                item = res_json["data"][0]
                if "b64_json" in item:
                    raw_data = item["b64_json"]
                elif "url" in item:
                    image_url = item["url"]
            elif "images" in res_json and len(res_json["images"]) > 0:
                image_url = res_json["images"][0]

            # 统一转存到 COS
            filename = f"{uuid.uuid4()}.png"
            final_url = ""
            if raw_data:
                final_url = upload_base64_to_cos(raw_data, filename)
            elif image_url:
                if image_url.startswith("data:image"):
                    final_url = upload_base64_to_cos(image_url, filename)
                else:
                    final_url = upload_url_to_cos(image_url, filename)
            else:
                raise Exception("无法从 API 响应中提取图片")

            # 更新数据库
            log.status = "success"
            log.image_url = final_url
            db.commit()
            
    except Exception as e:
        print(f"Background task error: {str(e)}")
        # 失败退款
        user.points += cost
        log.status = "failed"
        log.error_msg = str(e)
        db.commit()

@router.post("/generate")
async def generate_image(
    payload: image_schema.ImageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    异步生成图片：秒回 ID，后台画图并存入 COS
    """
    cost = PRICING.get(payload.quality, 5)
    if current_user.points < cost:
        raise HTTPException(status_code=403, detail="余额不足，请前往充值")
    
    # 预扣费并创建待处理记录
    current_user.points -= cost
    pending_log = image_crud.create_image_log(
        db, user_id=current_user.id, prompt=payload.prompt,
        quality=payload.quality, cost_points=cost, status="pending"
    )
    db.commit()
    
    # 启动后台任务 (使用 get_db 函数本身作为参数，在任务内部再获取会话)
    background_tasks.add_task(
        process_image_task, 
        pending_log.id, payload.prompt, payload.quality, cost, current_user.id, get_db
    )
    
    return {
        "id": pending_log.id,
        "status": "pending",
        "message": "任务已提交，AI 正在云端为您创作...",
        "remaining_points": current_user.points
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
