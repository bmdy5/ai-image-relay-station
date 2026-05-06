import time
import re

# 内存限流器
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

# 档次配置矩阵
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

# 预实例化全局限流器
enhance_limiter = SimpleRateLimiter(limit=5, window=60)
