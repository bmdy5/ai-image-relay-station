import os
import time
import uuid
import httpx
import asyncio
import re
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from backend.models.database import get_db, session_scope
from backend.models import models
from backend.schemas import image as image_schema
from backend.crud import image as image_crud
from backend.crud import recharge as recharge_crud
from backend.core.config import get_config
from backend.core.cos import upload_url_to_cos, upload_base64_to_cos
from backend.core.deps import get_current_user
from backend.core.prompt_enhance import enhance_prompt
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import Optional

# 导入解耦后的逻辑与配置
from backend.core.prompt import PRICING, TIER_CONFIG, enhance_limiter, wrap_prompt
from backend.services.image_service import process_image_task

router = APIRouter(prefix="/image", tags=["image"])

@router.get("/proxy")
async def proxy_image(url: str, current_user: models.User = Depends(get_current_user)):
    """代理获取图片以绕过前端 CORS 限制，需认证 + 白名单 + 内网防护"""
    from fastapi.responses import Response
    from urllib.parse import urlparse
    import ipaddress
    import socket

    MAX_RESPONSE_SIZE = 20 * 1024 * 1024  # 20MB
    ALLOWED_CONTENT_TYPES = {
        "image/png", "image/jpeg", "image/jpg", "image/webp",
        "image/gif", "image/avif", "image/svg+xml", "image/bmp"
    }

    parsed = urlparse(url)

    # 强制 HTTPS
    if parsed.scheme != "https":
        raise HTTPException(status_code=400, detail="仅支持 HTTPS 协议")

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="无效的 URL")

    def _is_internal_ip(ip_str: str) -> bool:
        try:
            ip = ipaddress.ip_address(ip_str)
            return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved
        except ValueError:
            return False

    # 白名单域名优先检查
    allowed_domains = [".myqcloud.com", ".openai.com", ".oaistatic.com"]
    is_whitelisted = any(hostname == d.lstrip(".") or hostname.endswith(d) for d in allowed_domains)
    if not is_whitelisted:
        raise HTTPException(status_code=403, detail="不允许代理该域名")

    if _is_internal_ip(hostname):
        raise HTTPException(status_code=403, detail="不允许访问内网地址")

    # DNS 解析后检查内网 IP（白名单域名跳过，COS 等可能解析到云内网 IP）
    if not is_whitelisted:
        try:
            loop = asyncio.get_event_loop()
            resolved_ip = await loop.run_in_executor(None, socket.gethostbyname, hostname)
            if _is_internal_ip(resolved_ip):
                raise HTTPException(status_code=403, detail="不允许访问内网地址")
        except socket.gaierror:
            raise HTTPException(status_code=400, detail="无法解析域名")

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=False) as client:
        try:
            resp = await client.get(url)
        except httpx.HTTPStatusError:
            raise HTTPException(status_code=502, detail="上游图片服务返回错误")
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="上游图片服务超时")
        except Exception:
            raise HTTPException(status_code=500, detail="图片代理请求失败")

    # 禁止重定向
    if resp.status_code in (301, 302, 303, 307, 308):
        raise HTTPException(status_code=403, detail="不允许重定向")

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"上游返回状态码 {resp.status_code}")

    # Content-Type 白名单
    content_type = resp.headers.get("content-type", "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=403, detail=f"不支持的内容类型: {content_type}")

    # 响应大小限制
    content_length = resp.headers.get("content-length")
    if content_length and int(content_length) > MAX_RESPONSE_SIZE:
        raise HTTPException(status_code=413, detail="响应内容过大")

    content = resp.content
    if len(content) > MAX_RESPONSE_SIZE:
        raise HTTPException(status_code=413, detail="响应内容过大")

    return Response(content=content, media_type=content_type)

@router.get("/config")
async def get_config_info():
    return {"pricing": PRICING, "tiers": TIER_CONFIG}

@router.get("/download")
async def download_image(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    log = db.query(models.ImageLog).filter(
        models.ImageLog.id == id, models.ImageLog.user_id == current_user.id
    ).first()
    if not log or not log.image_url: raise HTTPException(status_code=404, detail="图片不存在")
    return RedirectResponse(url=log.image_url)

class EnhanceRequest(BaseModel):
    prompt: str
    style_id: Optional[str] = "default"

@router.post("/enhance-prompt")
async def enhance_prompt_endpoint(
    payload: EnhanceRequest,
    current_user: models.User = Depends(get_current_user)
):
    """使用大模型优化用户提示词（助手模式 + 限流 + 风格准入校验）"""
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="提示词不能为空")
    
    # 0. 风格准入校验
    ALLOWED_STYLES = ["default", "real", "product", "tech_poster"]
    if payload.style_id not in ALLOWED_STYLES:
        raise HTTPException(status_code=400, detail="该风格已预设最佳参数，无需润色")

    # 1. 频率限制检查
    if not enhance_limiter.is_allowed(current_user.id):
        raise HTTPException(status_code=429, detail="操作过于频繁，请稍后再试（限每分钟5次）")

    # 2. 调用优化逻辑
    try:
        enhanced = await enhance_prompt(payload.prompt.strip(), payload.style_id)
        return {"original": payload.prompt, "enhanced": enhanced}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 优化失败: {str(e)[:100]}")

@router.post("/generate")
async def generate_image(payload: image_schema.ImageCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    active_count = image_crud.count_active_tasks(db, current_user.id)
    if active_count >= 3: raise HTTPException(status_code=429, detail="任务过多")
    if len(payload.prompt) > 1000: raise HTTPException(status_code=400, detail="提示词过长")
    
    cost = PRICING.get(payload.quality, 5)
    # 静默预占
    result = db.query(models.User).filter(
        models.User.id == current_user.id, 
        models.User.points - models.User.frozen_points >= cost
    ).update({"frozen_points": models.User.frozen_points + cost}, synchronize_session=False)
    if result == 0: raise HTTPException(status_code=403, detail="余额不足")
    
    # 迭代次数校验
    if payload.root_id:
        max_refines = 3 if payload.quality == "master" else (2 if payload.quality == "hd" else 0)
        total_refined_count = db.query(models.ImageLog).filter(
            models.ImageLog.root_id == payload.root_id,
            models.ImageLog.status == "success"
        ).count()
        
        if total_refined_count >= max_refines:
            raise HTTPException(status_code=403, detail=f"该种子图的迭代变体已达上限 ({max_refines}次)")

    pending_log = image_crud.create_image_log(
        db, user_id=current_user.id, prompt=payload.prompt, quality=payload.quality, 
        style=payload.style, cost_points=cost, status="pending",
        ref_image_url=payload.ref_image_url if payload.ref_image_url and not (payload.ref_image_url.startswith("data:image") or len(payload.ref_image_url) > 500) else (payload.ref_image_url[:50] + "..." if payload.ref_image_url else None), 
        parent_id=payload.parent_id, 
        root_id=payload.root_id,
        iteration=payload.iteration
    )
    db.commit()
    background_tasks.add_task(process_image_task, pending_log.id, payload.prompt, payload.quality, payload.style, cost, current_user.id, time.time(), payload.ref_image_url, payload.aspect_ratio)
    return {"id": pending_log.id, "status": "pending", "remaining_points": current_user.points, "iteration": payload.iteration}

@router.get("/status/{id}")
async def get_task_status(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    log = db.query(models.ImageLog).filter(
        models.ImageLog.id == id, models.ImageLog.user_id == current_user.id
    ).first()
    if not log:
        return {"id": id, "status": "failed", "image_url": None, "final_prompt": None, "iteration": 0, "parent_id": None, "error": "任务不存在或已过期"}
    return {
        "id": log.id,
        "status": log.status,
        "image_url": log.image_url,
        "final_prompt": getattr(log, "final_prompt", None),
        "iteration": log.iteration,
        "parent_id": log.parent_id,
        "error": log.error_msg
    }

@router.get("/history")
async def get_history(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logs = image_crud.get_user_image_logs(db, current_user.id, skip=skip, limit=limit)
    return [
        {
            "id": l.id, 
            "prompt": l.prompt, 
            "final_prompt": getattr(l, "final_prompt", None), 
            "status": l.status, 
            "image_url": l.image_url, 
            "ref_image_url": getattr(l, "ref_image_url", None), 
            "quality": l.quality, 
            "style": l.style,
            "iteration": l.iteration,
            "parent_id": l.parent_id,
            "root_id": l.root_id,
            "share_count": l.share_count or 0,
            "created_at": l.created_at
        } for l in logs
    ]

@router.delete("/{id}")
async def delete_image(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
    if not log or log.user_id != current_user.id: raise HTTPException(status_code=403, detail="无权")
    db.delete(log)
    db.commit()
    return {"message": "ok"}

@router.post("/{log_id}/share")
def increment_share_count(log_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="记录不存在")
    log.share_count = (log.share_count or 0) + 1
    db.commit()
    return {"status": "ok", "share_count": log.share_count}

@router.post("/reset")
async def reset_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """手动清理用户的挂起任务锁并同步积分状态"""
    image_crud.reset_active_tasks(db, current_user.id)
    return {"message": "ok"}
