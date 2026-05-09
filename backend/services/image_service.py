import time
import uuid
import httpx
import asyncio
from sqlalchemy.orm import Session
from backend.models.database import session_scope
from backend.models import models
from backend.crud import recharge as recharge_crud
from backend.core.config import get_config
from backend.core.cos import upload_url_to_cos, upload_base64_to_cos
from backend.core.prompt import wrap_prompt, TIER_CONFIG, COST_RMB
from backend.core.clothing_analyzer import analyze_clothing, clothing_to_prompt
from starlette.concurrency import run_in_threadpool

async def process_image_task(log_id: int, prompt: str, quality: str, style: str, cost: int, user_id: int, request_start_time: float, ref_image_url: str = None, aspect_ratio: str = "1:1", ref_image_url_2: str = None):
    """后台生图核心逻辑 (从 api/image.py 解耦)"""
    task_start_time = time.time()
    api_key = get_config("OPENAI_API_KEY")
    base_url = get_config("OPENAI_BASE_URL", "https://api.openai.com/v1")
    
    success, error_msg, final_url = False, "", ""
    api_ms, store_ms, gen_ms = 0, 0, 0

    try:
        with session_scope() as db:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if not user:
                raise Exception(f"用户 {user_id} 不存在")
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

        # 2. 服饰分析（virtual_tryon 风格 + 双图模式）
        clothing_desc = ""
        if style == "virtual_tryon" and ref_image_url_2:
            try:
                analysis = await analyze_clothing(ref_image_url_2)
                clothing_desc = clothing_to_prompt(analysis)
                print(f"--- [TryOn] Clothing: {clothing_desc} ---")
            except Exception as e:
                print(f"--- [TryOn] Clothing analysis failed: {e} ---")

        # 3. 提示词包装与注入
        if clothing_desc:
            # virtual_tryon 模式：用分析出的服饰描述替换用户 prompt
            prompt_to_send = wrap_prompt(style, clothing_desc, quality)
        else:
            prompt_to_send = wrap_prompt(style, prompt, quality)
        final_api_prompt = prompt_to_send

        with session_scope() as db:
            log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
            if log:
                log.status = "generating"
                if hasattr(log, "final_prompt"): log.final_prompt = prompt_to_send

        # 3. API 调用 (二进制 Multipart 协议，兼容中转站)
        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=180.0) as client:
                    # 准备二进制图片数据
                    image_data = None
                    if processed_ref_url:
                        if processed_ref_url.startswith("data:image"):
                            import base64
                            header, encoded = processed_ref_url.split(",", 1)
                            image_data = base64.b64decode(encoded)
                        elif processed_ref_url.startswith("http"):
                            img_resp = await client.get(processed_ref_url, timeout=30.0)
                            if img_resp.status_code == 200:
                                image_data = img_resp.content

                    # 根据是否有参考图选择端点
                    files = {}
                    if image_data:
                        api_path = "/images/edits"
                        files = {"image": ("ref.png", image_data, "image/png")}
                    else:
                        api_path = "/images/generations"

                    data = {
                        "model": "gpt-image-2",
                        "prompt": final_api_prompt,
                        "n": 1,
                        "quality": "low",
                    }
                    if not files:
                        data["response_format"] = "url"
                        data["input_fidelity"] = "low"

                    # 分辨率强制合规
                    if aspect_ratio == "9:16": data["size"] = "1024x1536"
                    elif aspect_ratio == "16:9": data["size"] = "1536x1024"
                    else: data["size"] = "1024x1024"

                    print(f"--- [API Request] ID: {log_id} | Endpoint: {api_path} | Quality: {data['quality']} | Img2Img: {'YES' if files else 'NO'} ---")

                    api_start = time.time()
                    if files:
                        resp = await client.post(
                            f"{base_url}{api_path}",
                            headers={"Authorization": f"Bearer {api_key}"},
                            data=data, files=files
                        )
                    else:
                        resp = await client.post(
                            f"{base_url}{api_path}",
                            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                            json=data
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

                # 5xx 服务端错误重试，429 限流重试
                if resp.status_code >= 500 or resp.status_code == 429:
                    if attempt < 2:
                        delay = (attempt + 1) * 2  # 2s, 4s 递进等待
                        print(f"--- [API Retry] ID: {log_id} | Status: {resp.status_code} | Waiting {delay}s (attempt {attempt + 1}/3)")
                        await asyncio.sleep(delay)
                        continue
                raise Exception(f"API Error ({resp.status_code}): {resp.text}")
            except (httpx.ConnectError, httpx.ConnectTimeout) as ce:
                if attempt < 2:
                    await asyncio.sleep(1)
                    continue
                raise ce

        if not success: raise Exception("未获取到有效图片链接")

        # 4. 结果转存 COS
        store_start = time.time()
        safe_prompt = "".join([c for c in prompt[:10] if c.isalnum()]).strip() or "image"
        cost_rmb = COST_RMB.get(quality, 0)
        filename = f"user_{username}_{safe_prompt}_{cost_rmb}元_{uuid.uuid4().hex[:6]}.png"
        
        if final_url.startswith("data:image") or len(final_url) > 2048:
            final_cos_url = await run_in_threadpool(upload_base64_to_cos, final_url, filename)
        else:
            final_cos_url = await run_in_threadpool(upload_url_to_cos, final_url, filename)
            
        store_ms = int((time.time() - store_start) * 1000)

        # 5. 更新数据库并打印审计日志
        with session_scope() as db:
            log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if log and user:
                log.status, log.image_url = "success", final_cos_url
                log.ref_image_url = processed_ref_url
                log.points_snapshot = cost
                log.api_duration, log.storage_duration = api_ms, store_ms
                log.total_duration = int((time.time() - task_start_time) * 1000)
                user.points -= cost
                user.frozen_points = max(0, user.frozen_points - cost)

                # 6. 邀请奖励触发：MySQL 分布式锁 + is_invitee_rewarded 防并发
                if user.invited_by_id:
                    from sqlalchemy import text
                    lock_name = f"invite_reward:{user.invited_by_id}"
                    result = db.execute(text("SELECT GET_LOCK(:lock_name, 0)"), {"lock_name": lock_name})
                    if not result.scalar():
                        print(f"--- [Invite Lock] Skipped: could not acquire lock for user {user.id}")
                    else:
                        try:
                            db.refresh(user)  # 锁后重读，防止并发幻读
                            if recharge_crud.can_receive_invitation_reward(db, user.invited_by_id) and \
                               not recharge_crud.is_invitee_rewarded(db, user.id):
                                inviter = db.query(models.User).filter(models.User.id == user.invited_by_id).first()
                                if inviter:
                                    inviter.points += 10
                                    recharge_crud.create_recharge_log(
                                        db,
                                        user_id=inviter.id,
                                        amount=10,
                                        status="success",
                                        admin_note=f"邀请好友 {user.uid} 完成首画奖励",
                                        operator_id=0,
                                        trade_no=f"INVITE_REWARD_{user.id}_{int(time.time())}"
                                    )
                        finally:
                            db.execute(text("SELECT RELEASE_LOCK(:lock_name)"), {"lock_name": lock_name})

                print(f"\n--- [Task Audit] ID: {log_id} | SUCCESS ---")
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
                user.frozen_points = max(0, user.frozen_points - cost)
