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

router = APIRouter(prefix="/image", tags=["image"])

@router.get("/proxy")
async def proxy_image(url: str):
    """代理获取图片以绕过前端 CORS 限制"""
    import httpx
    from fastapi.responses import Response
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=10.0)
            return Response(content=resp.content, media_type=resp.headers.get("content-type"))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# 内存限流器 (Task 1.2)
class SimpleRateLimiter:
    def __init__(self, limit: int = 5, window: int = 60):
        self.limit = limit
        self.window = window
        self.history = {} # {user_id: [timestamps]}

    def is_allowed(self, user_id: int) -> bool:
        now = time.time()
        if user_id not in self.history:
            self.history[user_id] = [now]
            return True
        
        # 清理过期的记录
        self.history[user_id] = [t for t in self.history[user_id] if now - t < self.window]
        
        if len(self.history[user_id]) < self.limit:
            self.history[user_id].append(now)
            return True
        return False

enhance_limiter = SimpleRateLimiter(limit=5, window=60)

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
    "default": "请根据【主题】自动生成一张高质量、高审美的作品。",
    "real": "极致写实风格，要求仿真现实，追求 8K 摄影级画质，皮肤纹理清晰，光影自然，主体与背景深度融合。内容：【主题】",
    "product": "以专业设计师的视角重新设计这个【主题】商品广告。以符合当下潮流和目标的精致设计。高阶商业审美，极简且富有视觉冲击力。", 
    "tech_poster": "封面海报，围绕【主题】展开，深色调，信息量大，具有高级科技感，色彩克制，信息主次清晰，排版考究。",
    "travel": "高阶旅游海报，采用【主题】作为唯一核心视觉。极简杂志排版风格，艺术性留白，醒目的复古旅行插画美学，色彩明快鲜艳。画面主体：【主题】。高级排版布局，具备视觉冲击力，旅行杂志封面质感。",
    "travel_guide": "请绘制一张色彩鲜艳、竖版（9:16）手绘风格的《【去哪里】旅行手账插画》，画风仿佛由一位充满好奇心的孩子用蜡笔创作，整体使用柔和温暖的浅色背景，营造温馨、童趣、满满旅行气息。主画面包含手账式旅行路线，用虚线连接多个地点，由【几天】日行程自动生成推荐景点、简短趣味描述、地标 Q 版手绘和当地美食图标。画面像一本童趣满满的旅行手账页面，带有手写字体和可爱贴纸感。地点：【去哪里】，天数：【几天】",
    "interior": "高端室内设计图，围绕【主题】展示空间重构方案。包含平面图与 3D 渲染图组合，空间通透，大面积留白，暖光氛围，极致干净高级感。主题：【主题】",
    "live_stream": "生成真实的移动端直播间截图，直播内容为【主题】。包含真实的直播界面 UI（如在线人数、热度、评论弹幕、礼物特效等），界面真实可辨，极具临场感。",
    "eri_silhouette": "请根据【主题】自动生成一张高审美的“轮廓宇宙 / 收藏版叙事海报”风格作品。不要将画面局限于固定器物或常见容器，不要优先默认瓶子、沙漏、玻璃罩、怀表之类的常规载体，而是由AI根据主题自行判断并选择一个最契合、最有象征意义、轮廓最强、最适合承载完整叙事世界的主轮廓载体。这个主轮廓可以是器物、建筑、门、塔、拱门、穹顶、楼梯井、长廊、雕像、侧脸、眼睛、手掌、头骨、羽翼、面具、镜面、王座、圆环、裂缝、光幕、阴影、几何结构、空间切面、舞台框景、抽象符号或其他更有创意与主题代表性的视觉轮廓，要求合理布局。轮廓内部或边界中需要自动生成与主题强绑定的完整叙事世界，内容应当丰富、饱满、层次清晰。风格融合收藏版电影海报构图、高级叙事型视觉设计、梦幻水彩质感与纸张印刷品气质，整体气质要高级、诗意、宏大、神圣、怀旧、安静、具有传说感和叙事感。",
    "silk_road": "宋代山水意境的中式国风插画，细腻的水墨勾线与柔和矿物颜料设色，银色月光洒落并映照水面，整体以浅蓝、青玉色为主调，点缀柔和粉色花枝，空气中带有朦胧雾气，河面流动倒影细腻，辅以若有若无的淡金色微光，电影感、诗意化灯光，空灵东方美学，高级国风绘本插画质感，4K 细节。近景特写：一位年轻女子倚坐在木窗边，安静地望向窗外月下流动的江河。主题：【主题】",
    "vintage_5s": "iPhone 5s 怀旧纪实风格摄影。采用柯达 Portra 400 胶片色调，具有明显的 2013 年移动摄影质感，色彩怀旧。重点渲染环境氛围：【环境】。",
    "ccd_snap": "CCD/iPhone 5s 闪光灯随手抓拍质感，模拟夜拍氛围。拍摄对象为人像：【主题】。拍摄场景环境：【环境】。要求：真实的光学镜头感，模拟 iPhone 5s 闪光灯带来的高对比度与真实肤色表现。严格保留参考图中的原生五官、皮肤肌理与毛孔质感，拒绝过度美颜和假皮肤。背景需呈现低饱和暗复古色调，朦胧感拉满，轻微胶片颗粒，背景虚化。",
    "relation_map": "请根据【主题】，生成一张高设计感的人物关系图海报。要求这张图不是普通插画，而是兼具信息可视化、叙事结构、海报设计感和作品风格还原度的人物关系图。识别并展示关键人物关系，包括血缘、爱情、友情、联盟、敌对、师徒、主从、操控、背叛、秘密关系等。风格还原作品气质，用不同颜色、线型、箭头区分不同关系，保证线条清晰、层次分明、不杂乱。",
    "encyclopedia": "请根据【主题】自动生成一张“博物馆图鉴式中文拆解信息图”。要求整张图兼具真实写实主视觉、结构拆解、中文标注、材质说明、纹样寓意、色彩含义和核心特征总结。你需要根据【主题】自动判断最合适的主体对象、服饰体系、器物结构、时代风格、关键部件、材质工艺、颜色方案与版式结构，用户无需再提供其他信息。整体风格应为：国家博物馆展板、历史服饰图鉴、文博专题信息图，而不是普通海报、古风写真、电商详情页或动漫插画。背景采用米白、绢纸白、浅茶色等纸张质感，整体高级、克制、专业、可收藏。版式固定为：- 顶部：中文主标题 + 副标题 + 导语 - 左侧：结构拆解区，中文引线标注关键部件，并配局部特写 - 右上：材质 / 工艺 / 质感区，展示真实纹理小样并附说明 - 右中：纹样 / 色彩 / 寓意区，展示主色板、纹样样本和文化解释 - 底部：穿着顺序 / 构成流程图 + 核心特征总结。若主题适合人物展示，则以真实人物全身站姿为中央主体；若更适合器物或单体结构，则改为中心主体拆解图，但整体仍保持完整中文信息图形式。所有文字必须为简体中文，清晰、规整、可读，不要乱码、错字、英文或拼音。重点突出真实结构、材质差异、文化说明与图鉴气质。避免：海报感、影楼感、电商感、动漫感、cosplay感、乱标注、错结构、糊字、假材质、过度装饰。",
    "restore_old": "专业老照片修复。要求：严格保留人物的原始五官、神态、发型和服饰特征，不做任何改动。去除照片上的所有污渍、划痕、霉斑、泛黄和褪色，还原面部的皮肤纹理、五官细节，以及帽子和衣领的材质质感。提升整体清晰度，修正模糊，优化黑白照片的光影层次，让画面干净自然，真实还原老照片的质感，不添加任何虚假或AI生成的额外细节。仿真现实。",
    "ui_upgrade": "你是一位资深 UI 设计师。请深度分析参考图中的 UI 布局和功能结构，你的任务是直接输出这张 UI 的视觉进化版。核心要求：1. 严禁改动布局：按钮在哪里，导航在哪里，必须保持原样。2. 视觉拉满：应用现代最高标准的 UI 审美，优化所有的间距（对齐）、圆角（统一）和阴影（多层呼吸感）。3. 组件重绘：将图中简陋的占位符图标替换为极具质感的现代矢量图标或 3D 图标。4. 材质升级：为界面加入细腻的材质，如轻微的磨砂玻璃效果、丝滑的渐变色和专业级的布光效果。请直接生成那张最完美的、高保真的、可以直接拿来做产品的 UI 设计稿。",
    "knowledge_card": "请根据【主题】生成一张高质量竖版「科普百科图」。这张图不是普通海报,也不是单纯插画,而是一张兼具“图鉴感、百科感、信息结构感、收藏感”的模块化科普信息图。整体风格参考高级博物图鉴、现代百科书页、生活方式知识卡和社交媒体高传播信息图的结合。请让画面包含: - 一个清晰漂亮的主题主视觉 - 若干局部特征放大细节 - 多个圆角模块化信息分区 - 清楚的标题层级与重点标签 - 简洁但丰富的百科内容 - 可视化评分、要点总结或Top 5模块内容栏目请根据主题自动适配,优先从这些方向中选择并合理组合:基础档案、分类信息、外观特征、习性/生态、形成机制/结构组成、生长或使用条件、养护或维护建议、风险与注意事项、适合人群或适用场景、优缺点对比、快速评分卡。视觉要求:浅色干净背景,柔和配色,轻阴影,精致小图标,圆角信息框,整洁排版,信息密度高但不拥挤,阅读体验好。整体必须像真正可以发布、阅读、收藏、系列化生产的科普百科卡,而不是广告图。请不要做成普通商业宣传海报。要突出“知识整理 + 模块信息 + 图鉴式展示”的特征。",
    "product_detail": "为这个【主题】设计一个详情页，复古简约，且精致。符合现代审美。要求具备高级感排版、温润的光影质感、以及商业级的图文构图。",
    "app_ui_design": "设计一个【主题】，包含首页，功能页，个人中心页等必要页面的内容UI设计。采用 iOS 原生设计语言，极致注重用户体验、交互细节、图标质感、排版美感和色彩方案。整体呈现为一个高保真的 APP 视觉全案设计稿。",
    "campaign_poster": "请根据参考图角色，设计一个移动端运营页面海报。主题为：【主题】。包含精美的视觉主视觉、活动简介区、参与任务区，以及底部的“立即报名”动作按钮。整体采用 9:16 竖版构图，符合现代移动端审美，色彩明快，具备极强的活动传播力和视觉冲击力。"
}

def wrap_prompt(style_id: str, raw_prompt: str, quality: str) -> str:
    """提示词包装引擎 (V2.2 深度同步版)"""
    template = STYLE_PROMPT_TEMPLATES.get(style_id)
    
    # 人像仿真补丁 (Portrait Fusion Patch)
    portrait_fusion = ""
    if style_id in ["real", "vintage_5s", "ccd_snap", "live_stream", "anime", "eri_silhouette"]:
        portrait_fusion = " (画面要求：整体光影必须统一，主体与环境之间有自然的阴影遮蔽和反光交互，严禁背景突兀，确保主体与背景深度融合。) "
    
    # 人像真实度与灵动构图补丁 (Diverse Poses & Face Preservation)
    realism_patch = ""
    if style_id in ["vintage_5s", "ccd_snap", "real", "restore_old"]:
        realism_patch = (
            " (人像核心要求：构图需自然多样（支持全身照、坐姿、站姿、侧身等多种生动角度），服饰搭配需高度统一、精致且具有质感。要求AI必须严丝合缝地保留参考图中的面部五官特征、比例与眼神，"
            "严禁任何形式的五官变形或面部重塑。画面呈现必须完全自然，禁止过度锐化或假脸美颜，保留皮肤毛孔细节，确保光学镜头般的写实度与肢体协调感。) "
        )

    # 图生图参考一致性强制约束 (Legacy Support)
    ref_consistency = ""
    if style_id in ["vintage_5s", "ccd_snap", "interior"]:
        ref_consistency = " (CRITICAL: Strictly maintain identity/gender of reference image) "

    if not template:
        final_prompt = f"{raw_prompt}{ref_consistency}{portrait_fusion}{realism_patch}"
    else:
        pattern = r"【(.*?)】"
        matches = re.findall(pattern, raw_prompt)
        if not matches:
            # 兼容模式：支持 @ 或 # 作为参数分隔符
            for sep in [" @ ", "@", " # ", "#"]:
                if sep in raw_prompt:
                    matches = [p.strip() for p in raw_prompt.split(sep) if p.strip()]
                    break
            
            # 传统的冒号兼容
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
        
        final_prompt = f"{final_prompt}{ref_consistency}{portrait_fusion}{realism_patch}"

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
                log.points_snapshot = cost # 记录消费快照
                log.api_duration, log.storage_duration = api_ms, store_ms
                log.total_duration = int((time.time() - task_start_time) * 1000)
                user.points -= cost # 成功后才真正扣除余额
                user.frozen_points = max(0, user.frozen_points - cost)

                # 6. 邀请奖励触发 (首画成功后发放给邀请人)
                if user.invited_by_id:
                    # 检查是否为该用户的首次成功画图
                    success_count = db.query(models.ImageLog).filter(
                        models.ImageLog.user_id == user_id,
                        models.ImageLog.status == "success"
                    ).count()
                    
                    if success_count == 1:
                        # 检查邀请人今日奖励限额 (5次) 以及该受邀者是否已发放过
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
                                print(f"--- [Invitation Reward] Inviter {inviter.id} rewarded 10 pts for invitee {user.id} ---")

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
                # 失败仅释放冻结额度，不退回 points (因为 points 没变)
                user.frozen_points = max(0, user.frozen_points - cost)

@router.get("/config")
async def get_config_info():
    return {"pricing": PRICING, "tiers": TIER_CONFIG}

@router.get("/download")
async def download_image(id: int, db: Session = Depends(get_db)):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
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
    
    # 0. 风格准入校验 (Task: Strategy B - Strict Whitelist)
    # 仅允许基础视觉风格进行润色，结构化风格严禁进入，以防干扰模版逻辑
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
    # 静默预占：仅增加 frozen_points，检查 points - frozen_points 是否足够
    result = db.query(models.User).filter(
        models.User.id == current_user.id, 
        models.User.points - models.User.frozen_points >= cost
    ).update({"frozen_points": models.User.frozen_points + cost}, synchronize_session=False)
    if result == 0: raise HTTPException(status_code=403, detail="余额不足")
    
    # 迭代次数校验 (基于 root_id 的总变体数限制)
    if payload.root_id:
        max_refines = 3 if payload.quality == "master" else (2 if payload.quality == "hd" else 0)
        # 统计该种子图下的所有成功变体数量
        total_refined_count = db.query(models.ImageLog).filter(
            models.ImageLog.root_id == payload.root_id,
            models.ImageLog.status == "success"
        ).count()
        
        if total_refined_count >= max_refines:
            raise HTTPException(status_code=403, detail=f"该种子图的迭代变体已达上限 ({max_refines}次)")

    pending_log = image_crud.create_image_log(
        db, user_id=current_user.id, prompt=payload.prompt, quality=payload.quality, 
        style=payload.style, cost_points=cost, status="pending",
        ref_image_url=payload.ref_image_url, 
        parent_id=payload.parent_id, 
        root_id=payload.root_id,
        iteration=payload.iteration
    )
    db.commit()
    background_tasks.add_task(process_image_task, pending_log.id, payload.prompt, payload.quality, payload.style, cost, current_user.id, time.time(), payload.ref_image_url, payload.aspect_ratio)
    return {"id": pending_log.id, "status": "pending", "remaining_points": current_user.points, "iteration": payload.iteration}

@router.get("/status/{id}")
async def get_task_status(id: int, db: Session = Depends(get_db)):
    log = db.query(models.ImageLog).filter(models.ImageLog.id == id).first()
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
