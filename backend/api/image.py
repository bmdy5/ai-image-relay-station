import os
import time
import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from backend.models.database import get_db, session_scope
from backend.models import models
from backend.schemas import image as image_schema
from backend.crud import image as image_crud
from backend.core.config import get_config
from backend.core.cos import upload_url_to_cos, upload_base64_to_cos
from backend.core.deps import get_current_user
from starlette.concurrency import run_in_threadpool

router = APIRouter(prefix="/image", tags=["image"])

# 档次配置矩阵
TIER_CONFIG = {
    "standard": {"size": "1024x1024", "quality": "standard"},
    "hd": {"size": "1024x1536", "quality": "standard"},
    "master": {"size": "1024x1792", "quality": "high"}
}

# 计费标准 (用户支付积分)
PRICING = {"standard": 5, "hd": 15, "master": 30}

# 成本矩阵 (RMB) - 基于 API 实际支出估算
COST_RMB = {
    "standard": 0.29,
    "hd": 0.58,
    "master": 0.58
}

@router.get("/config")
async def get_config_info():
    """获取生图档位与计费配置"""
    return {
        "pricing": PRICING,
        "tiers": TIER_CONFIG
    }

async def process_image_task(log_id: int, prompt: str, quality: str, cost: int, user_id: int, request_start_time: float):
    """
    后台任务 (精简版)：直接执行单次生图逻辑，不进行任何重试以保护资金安全。
    """
    task_start_time = time.time()
    api_key = get_config("OPENAI_API_KEY")
    base_url = get_config("OPENAI_BASE_URL", "https://api.openai.com/v1")
    config = TIER_CONFIG.get(quality, TIER_CONFIG["standard"])
    
    success = False
    error_msg = ""
    final_url = ""
    api_ms = 0
    store_ms = 0
    gen_ms = 0

    try:
        # 1. 设置生成状态
        with session_scope() as db:
            log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
            if log: log.status = "generating"

        # 2. 调用 AI 接口
        api_start = time.time()
        async with httpx.AsyncClient(timeout=180.0) as client:
            payload = {
                "model": "gpt-image-2", "prompt": prompt, "n": 1,
                "size": config["size"], "response_format": "url"
            }
            if config["quality"] == "high": payload["quality"] = "high"
            
            response = await client.post(
                f"{base_url}/images/generations",
                headers={"Authorization": f"Bearer {api_key}"}, json=payload
            )
        api_ms = int((time.time() - api_start) * 1000)
        
        if response.status_code != 200:
            raise Exception(f"API Error ({response.status_code}): {response.text}")
        
        res_json = response.json()
        image_url = ""
        if "data" in res_json and res_json["data"]:
            item = res_json["data"][0]
            image_url = item.get("b64_json") or item.get("url")
        elif "images" in res_json and res_json["images"]:
            image_url = res_json["images"][0]

        if not image_url: raise Exception("未获取到图片路径")

        # 3. 设置转存状态
        with session_scope() as db:
            log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
            if log: log.status = "storing"

        # 4. 转存 COS
        store_start = time.time()
        filename = f"user_{user_id}_{uuid.uuid4().hex[:8]}.png"
        
        if image_url.startswith("data:image") or len(image_url) > 1000:
            final_url = await run_in_threadpool(upload_base64_to_cos, image_url, filename)
        else:
            final_url = await run_in_threadpool(upload_url_to_cos, image_url, filename)
        
        store_ms = int((time.time() - store_start) * 1000)
        gen_ms = int((time.time() - api_start) * 1000) - store_ms
        success = True

    except Exception as e:
        error_raw = repr(e)
        if "Timeout" in error_raw or "ConnectError" in error_raw:
            error_msg = "网络请求超时或连接中断，积分已原路退还，请稍后重试。"
        else:
            error_msg = f"系统处理异常 ({error_raw[:50]})，积分已原路退还。"

    # 5. 最终结算与归档
    total_time_ms = int((time.time() - request_start_time) * 1000)
    with session_scope() as db:
        log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if log and user:
            log.total_duration = total_time_ms
            log.queue_duration = int((task_start_time - request_start_time) * 1000)
            if success:
                log.status, log.image_url = "success", final_url
                log.api_duration, log.storage_duration, log.generation_duration = api_ms, store_ms, gen_ms
                user.frozen_points = max(0, user.frozen_points - cost)
            else:
                log.status, log.error_msg = "failed", error_msg
                user.points += cost # 失败退费
                user.frozen_points = max(0, user.frozen_points - cost)

    # 6. 后台审计日志 (盈利分析版)
    status_tag = "SUCCESS" if success else f"FAILED ({error_msg[:30]})"
    refund_tag = " [Refunded]" if not success else ""
    
    user_pay_rmb = cost * 0.1
    api_cost_rmb = COST_RMB.get(quality, 0) if success else 0
    profit_rmb = user_pay_rmb - api_cost_rmb if success else 0

    print(f"\\n--- [Task Audit] ID:{log_id} | {status_tag}{refund_tag} ---")
    if success:
        print(f"Revenue: {user_pay_rmb:.2f} RMB | Cost: {api_cost_rmb:.2f} RMB | Profit: +{profit_rmb:.2f} RMB")
    else:
        print(f"Status: FAILED | Refund: {user_pay_rmb:.2f} RMB")
    print(f"Total Time: {total_time_ms/1000:.2f}s (API: {api_ms/1000:.2f}s, Store: {store_ms/1000:.2f}s)")
    print(f"{'='*50}\\n")

@router.post("/generate")
async def generate_image(payload: image_schema.ImageCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    active_count = image_crud.count_active_tasks(db, current_user.id)
    if active_count >= 2:
        raise HTTPException(status_code=429, detail="当前有 2 个活动任务正在进行，请稍候再试")

    # Prompt 字数限制 (Task: Security)
    if len(payload.prompt) > 1000:
        raise HTTPException(status_code=400, detail="提示词过长，请控制在 1000 字以内")

    cost = PRICING.get(payload.quality, 5)
    result = db.query(models.User).filter(models.User.id == current_user.id, models.User.points >= cost).update({"points": models.User.points - cost, "frozen_points": models.User.frozen_points + cost}, synchronize_session=False)
    if result == 0: raise HTTPException(status_code=403, detail="余额不足")
    pending_log = image_crud.create_image_log(db, user_id=current_user.id, prompt=payload.prompt, quality=payload.quality, cost_points=cost, status="pending")
    db.commit()
    background_tasks.add_task(process_image_task, pending_log.id, payload.prompt, payload.quality, cost, current_user.id, time.time())
    return {"id": pending_log.id, "status": "pending", "remaining_points": current_user.points}

@router.get("/status/{id}")
async def get_task_status(id: int, db: Session = Depends(get_db)):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
    if not log: raise HTTPException(status_code=404, detail="任务不存在")
    return {"id": log.id, "status": log.status, "image_url": log.image_url, "error": log.error_msg, "cost_points": log.cost_points, "timings": {"queue": log.queue_duration, "api": log.api_duration, "generation": log.generation_duration, "storage": log.storage_duration, "total": log.total_duration} if log.status in ["success", "failed"] else None}

@router.get("/batch-status")
async def get_batch_status(ids: str = Query(...), db: Session = Depends(get_db)):
    id_list = [int(i) for i in ids.split(",") if i.strip()]
    logs = db.query(models.ImageLog).filter(models.ImageLog.id.in_(id_list)).all()
    return [{"id": l.id, "status": l.status, "image_url": l.image_url, "timings": {"total": l.total_duration} if l.status in ["success", "failed"] else None} for l in logs]

@router.get("/history")
async def get_history(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logs = image_crud.get_user_image_logs(db, current_user.id, skip=skip, limit=limit)
    return [{"id": l.id, "prompt": l.prompt, "status": l.status, "image_url": l.image_url, "created_at": l.created_at, "timings": {"total": l.total_duration} if l.status in ["success", "failed"] else None} for l in logs]

@router.get("/download")
async def download_image(id: int, db: Session = Depends(get_db)):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
    if not log or not log.image_url: raise HTTPException(status_code=404, detail="图片不存在")
    return RedirectResponse(url=log.image_url)

@router.delete("/{id}")
async def delete_image(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
    if not log or log.user_id != current_user.id: raise HTTPException(status_code=403, detail="无权操作")
    db.delete(log)
    db.commit()
    return {"message": "删除成功"}
