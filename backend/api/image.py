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
from backend.core.config import get_config
from backend.core.cos import upload_url_to_cos, upload_base64_to_cos
from backend.core.deps import get_current_user
from starlette.concurrency import run_in_threadpool

router = APIRouter(prefix="/image", tags=["image"])

# 档次配置矩阵 (Task 1.1)
TIER_CONFIG = {
    "standard": {"size": "1024x1024", "quality": "standard"},
    "hd": {"size": "1024x1536", "quality": "standard"},
    "master": {"size": "1024x1792", "quality": "standard"}
}

# 计费标准 (用户支付积分)
PRICING = {"standard": 5, "hd": 10, "master": 15}

# 成本矩阵 (RMB)
COST_RMB = {"standard": 0.45, "hd": 0.58, "master": 0.58}

STYLE_PROMPT_TEMPLATES = {
    "default": "【主题】",
    "anime": "Anime style, high quality illustration of 【主题】, vibrant colors, detailed eyes, masterpiece",
    "cyberpunk": "Cyberpunk aesthetic, neon lights, futuristic city background, 【主题】, cinematic lighting, highly detailed",
    "oil_painting": "Oil painting style, thick brushwork, artistic texture, 【主题】, rich colors, museum quality",
    "sketch": "Hand-drawn pencil sketch of 【主题】, clean lines, minimalist, white background",
    "vintage_5s": "iPhone 5s documentary style, low dynamic range, high digital noise, 2013 mobile photography, flat lighting, casual snap of 【主题】, nostalgic mobile aesthetic",
    "interior": "Luxury interior photography, wide angle, soft natural lighting, elegant 【主题】 room design, 8k resolution, architectural digest style",
    "poster_pro": "Professional advertising poster for 【主题】, clean minimalist design, high-end commercial lighting, symmetrical composition, 8k resolution",
    "encyclopedia": "Encyclopedia infographic style, detailed scientific illustration of 【主题】, labeled parts, clean background, educational layout"
}

def wrap_prompt(style_id: str, raw_prompt: str, quality: str) -> str:
    """提示词包装引擎 (V2.1 强化版)"""
    template = STYLE_PROMPT_TEMPLATES.get(style_id)
    
    # 图生图风格强制约束
    ref_consistency = ""
    if style_id in ["vintage_5s", "interior"]:
        ref_consistency = " (CRITICAL: Strictly maintain identity/gender of reference image) "

    if not template:
        final_prompt = f"{raw_prompt}{ref_consistency}"
    else:
        pattern = r"【(.*?)】"
        matches = re.findall(pattern, raw_prompt)
        if not matches and (":" in raw_prompt or "：" in raw_prompt):
            clean_input = re.split(r"[:：]", raw_prompt)[-1].strip()
            if clean_input: matches = [clean_input]

        if matches:
            user_val = matches[0]
            final_prompt = re.sub(r"【.*?】", user_val, template, count=1)
            remaining_matches = matches[1:]
            for val in remaining_matches:
                final_prompt = re.sub(r"【.*?】", val, final_prompt, count=1)
            final_prompt = re.sub(r"【.*?】", "", final_prompt)
        else:
            final_prompt = re.sub(r"【.*?】", raw_prompt, template, count=1)
            final_prompt = re.sub(r"【.*?】", "", final_prompt)
        
        final_prompt = f"{final_prompt}{ref_consistency}"

    # 画质增强
    if quality == "master":
        final_prompt += ", masterpiece, ultra-high definition, 8k, unreal engine 5 render, cinematic lighting"
    elif quality == "hd":
        final_prompt += ", high quality, 4k, sharp focus"
        
    return final_prompt

async def process_image_task(log_id: int, prompt: str, quality: str, style: str, cost: int, user_id: int, request_start_time: float, ref_image_url: str = None, aspect_ratio: str = "1:1"):
    """后台生图核心逻辑"""
    task_start_time = time.time()
    api_key = get_config("OPENAI_API_KEY")
    base_url = get_config("OPENAI_BASE_URL", "https://api.openai.com/v1")
    config = TIER_CONFIG.get(quality, TIER_CONFIG["standard"])
    
    success, error_msg, final_url = False, "", ""
    api_ms, store_ms, gen_ms = 0, 0, 0

    try:
        with session_scope() as db:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            username = user.username or f"uid_{user_id}"

        # 1. 参考图转存
        processed_ref_url = ref_image_url
        if ref_image_url and (ref_image_url.startswith("data:image") or len(ref_image_url) > 1000):
            try:
                safe_username = "".join([c for c in username if c.isalnum() or c in ("_", "-")])
                ref_filename = f"user_{safe_username}_ref_{uuid.uuid4().hex[:6]}.png"
                processed_ref_url = await run_in_threadpool(upload_base64_to_cos, ref_image_url, ref_filename)
            except Exception as e:
                raise Exception(f"参考图上传失败: {str(e)}")

        # 2. 提示词包装与注入
        prompt_to_send = wrap_prompt(style, prompt, quality)
        final_api_prompt = prompt_to_send
        # 注意：图生图不再手动将 URL 塞进 Prompt，而是通过 images 数组传递

        with session_scope() as db:
            log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
            if log:
                log.status = "generating"
                if hasattr(log, "final_prompt"): log.final_prompt = prompt_to_send

        # 3. API 调用 (GPT-Image-2 专用 Vision-JSON 协议)
        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=180.0) as client:
                    # 终极实锤协议：/v1/images/edits + JSON
                    api_path = "/images/generations"
                    payload = {
                        "model": "gpt-image-2", 
                        "prompt": final_api_prompt, 
                        "n": 1,
                        "response_format": "url",
                        "quality": "low" # 极致省钱模式
                    }

                    # 图生图模式切换 (Verified Protocol)
                    if processed_ref_url:
                        api_path = "/images/edits"
                        payload["images"] = [{"image_url": processed_ref_url}]

                    # 分辨率强制合规
                    if aspect_ratio == "9:16": payload["size"] = "1024x1536"
                    elif aspect_ratio == "16:9": payload["size"] = "1536x1024"
                    else: payload["size"] = "1024x1024"

                    print(f"--- [API Request] ID: {log_id} | Model: gpt-image-2 | Quality: {payload['quality']} | Img2Img: {'YES' if processed_ref_url else 'NO'} ---")
                    
                    api_start = time.time()
                    resp = await client.post(
                        f"{base_url}{api_path}", 
                        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}, 
                        json=payload
                    )
                    api_ms = int((time.time() - api_start) * 1000)
                
                if resp.status_code == 200:
                    res_json = resp.json()
                    data_list = res_json.get("data", [])
                    if data_list:
                        final_url = data_list[0].get("url") or data_list[0].get("b64_json")
                    elif res_json.get("images"):
                        final_url = res_json["images"][0]
                    
                    if final_url:
                        success = True
                        break
                raise Exception(f"API Error ({resp.status_code}): {resp.text}")
            except (httpx.ConnectError, httpx.ConnectTimeout) as ce:
                if attempt < 2: 
                    await asyncio.sleep(1)
                    continue
                raise ce
            except Exception as e:
                raise e

        if not success: raise Exception("未获取到有效图片链接")

        # 4. 结果转存 COS
        store_start = time.time()
        safe_prompt = "".join([c for c in prompt[:10] if c.isalnum()]).strip() or "image"
        cost_rmb = COST_RMB.get(quality, 0)
        filename = f"user_{username}_{safe_prompt}_{cost_rmb}元_{uuid.uuid4().hex[:6]}.png"
        
        # 智能选择上传方式 (Task: Base64 Support)
        if final_url.startswith("data:image") or len(final_url) > 2048:
            final_cos_url = await run_in_threadpool(upload_base64_to_cos, final_url, filename)
        else:
            final_cos_url = await run_in_threadpool(upload_url_to_cos, final_url, filename)
            
        store_ms = int((time.time() - store_start) * 1000)

        # 5. 更新数据库并打印深度审计日志 (Task: Deep Transparency)
        with session_scope() as db:
            log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if log and user:
                log.status, log.image_url = "success", final_cos_url
                log.ref_image_url = processed_ref_url # 存入参考图链接
                log.api_duration, log.storage_duration = api_ms, store_ms
                log.total_duration = int((time.time() - task_start_time) * 1000)
                user.frozen_points = max(0, user.frozen_points - cost)

                # 打印增强版控制台审计日志
                print(f"\n--- [Task Audit] ID: {log_id} | SUCCESS ---")
                print(f"Model: gpt-image-2 | Style: {style} | Quality: {quality}")
                print(f"Img2Img: {'YES' if processed_ref_url else 'NO'}")
                if processed_ref_url:
                    print(f"Ref-Image URL: {processed_ref_url}")
                print(f"Final Sent Prompt: {final_api_prompt[:200]}...")
                print(f"Revenue: {cost/10:.2f} RMB | Cost: {cost_rmb:.2f} RMB | Profit: +{(cost/10)-cost_rmb:.2f} RMB")
                print(f"Total Time: {log.total_duration/1000:.2f}s (API: {api_ms/1000:.2f}s, Store: {store_ms/1000:.2f}s)")
                print("="*50 + "\n")

    except Exception as e:
        error_msg = repr(e)
        print(f"--- [Task Error] ID:{log_id} | {error_msg} ---")
        with session_scope() as db:
            log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if log and user:
                log.status, log.error_msg = "failed", error_msg
                user.points += cost # 退费
                user.frozen_points = max(0, user.frozen_points - cost)

@router.get("/config")
async def get_config_info():
    return {"pricing": PRICING, "tiers": TIER_CONFIG}

@router.post("/generate")
async def generate_image(payload: image_schema.ImageCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    active_count = image_crud.count_active_tasks(db, current_user.id)
    if active_count >= 3: raise HTTPException(status_code=429, detail="任务过多")
    if len(payload.prompt) > 1000: raise HTTPException(status_code=400, detail="提示词过长")
    
    cost = PRICING.get(payload.quality, 5)
    result = db.query(models.User).filter(models.User.id == current_user.id, models.User.points >= cost).update({"points": models.User.points - cost, "frozen_points": models.User.frozen_points + cost}, synchronize_session=False)
    if result == 0: raise HTTPException(status_code=403, detail="余额不足")
    
    pending_log = image_crud.create_image_log(db, user_id=current_user.id, prompt=payload.prompt, quality=payload.quality, style=payload.style, cost_points=cost, status="pending")
    db.commit()
    background_tasks.add_task(process_image_task, pending_log.id, payload.prompt, payload.quality, payload.style, cost, current_user.id, time.time(), payload.ref_image_url, payload.aspect_ratio)
    return {"id": pending_log.id, "status": "pending", "remaining_points": current_user.points}

@router.get("/status/{id}")
async def get_task_status(id: int, db: Session = Depends(get_db)):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
    if not log: raise HTTPException(status_code=404, detail="不存在")
    return {"id": log.id, "status": log.status, "image_url": log.image_url, "final_prompt": getattr(log, "final_prompt", None), "error": log.error_msg}

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
            "ref_image_url": getattr(l, "ref_image_url", None), # 传回参考图
            "quality": l.quality, # 传回质量档次
            "style": l.style,     # 传回风格 ID
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
