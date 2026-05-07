# Prompt Engine Upgrade (V2.2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize detailed universal Chinese prompt templates from the specification document to the backend and update the frontend UI to match.

**Architecture:** 
- Expand the `STYLE_PROMPT_TEMPLATES` dictionary in the backend with long-form Chinese structural instructions.
- Implement an "Interaction/Simulation Patch" in `wrap_prompt` to inject realism constraints for portrait-related styles.
- Update frontend style lists to include the new "CCD 随手抓拍" name and generalized placeholders.

**Tech Stack:** Python (FastAPI/httpx), React (JSX)

---

### Task 1: Backend Template Synchronization
**Files:**
- Modify: `backend/api/image.py`

- [ ] **Step 1: Update STYLE_PROMPT_TEMPLATES with full-depth generalized Chinese prompts.**
```python
STYLE_PROMPT_TEMPLATES = {
    "default": "请根据【主题】自动生成一张高质量、高审美的作品。",
    "real": "极致写实风格，要求仿真现实，追求 8K 摄影级画质，皮肤纹理清晰，光影自然，主体与背景深度融合。内容：【主题】",
    "product": "桌面摆件，做成白底电商主图，针对【主题】进行重新打光，产品更精致，纯白背景，柔光效果，突出产品主体。",
    "tech_poster": "封面海报，围绕【主题】展开，深色调，信息量大，具有高级科技感，色彩克制，信息主次清晰，排版考究。",
    "travel": "竖版长图，旅游主题海报，展示与【主题】相关的多个核心场景。每个模块包含精致插画 + 艺术书法 + 文字简介，高端杂志排版，留白合理。主题：【主题】",
    "interior": "高端室内设计图，围绕【主题】展示空间重构方案。包含平面图与 3D 渲染图组合，空间通透，大面积留白，暖光氛围，极致干净高级感。主题：【主题】",
    "live_stream": "生成真实的移动端直播间截图，直播内容为【主题】。包含真实的直播界面 UI（如在线人数、热度、评论弹幕、礼物特效等），界面真实可辨，极具临场感。",
    "eri_silhouette": "请根据【主题】自动生成一张高审美的“轮廓宇宙 / 收藏版叙事海报”风格作品。不要将画面局限于固定器物或常见容器... (完整搬运文档第 6-16 行内容) ...内容：【主题】",
    "silk_road": "宋代山水意境的中式国风插画，细腻的水墨勾线与柔和矿物颜料设色，银色月光洒落并映照水面，整体以浅蓝、青玉色为主调，点缀柔和粉色花枝，空气中带有朦胧雾气，河面流动倒影细腻，辅以若有若无的淡金色微光，电影感、诗意化灯光，空灵东方美学，高级国风绘本插画质感，4K 细节。近景特写：一位年轻女子倚坐在木窗边，安静地望向窗外月下流动的江河。主题：【主题】",
    "vintage_5s": "CCD/iPhone 5s 闪光灯随手抓拍质感，模拟夜拍氛围。拍摄对象为【主题】。要求：真实的光学镜头感，高对比度闪光灯效果。严格保留参考图中的原生五官、皮肤肌理与毛孔质感，拒绝过度美颜和假皮肤。背景为昏暗的环境氛围，低饱和复古色调，朦胧感拉满，轻微胶片颗粒。",
    "relation_map": "请根据【主题】，生成一张高设计感的人物关系图海报。要求这张图不是普通插画，而是兼具信息可视化、叙事结构、海报设计感和作品风格还原度的人物关系图... (完整搬运文档第 106-127 行内容) ...",
    "encyclopedia": "请根据【主题】生成一张高质量竖版「科普百科图」。这张图不是普通海报，也不是单纯插画，而是一张兼具 “图鉴感、百科感、信息结构感、收藏感” 的模块化科普信息图... (完整搬运文档第 18-40 行内容) ..."
}
```

- [ ] **Step 2: Update wrap_prompt logic to include the Portrait/CCD patch.**
```python
def wrap_prompt(style_id: str, raw_prompt: str, quality: str) -> str:
    template = STYLE_PROMPT_TEMPLATES.get(style_id)
    
    # 人像仿真补丁 (Portrait Fusion Patch)
    portrait_fusion = ""
    if style_id in ["real", "vintage_5s", "live_stream", "anime", "eri_silhouette"]:
        portrait_fusion = " (画面要求：整体光影必须统一，主体与环境之间有自然的阴影遮蔽和反光交互，严禁背景突兀，确保主体与背景深度融合。) "
    
    # CCD 专项负向约束
    negative_constraints = ""
    if style_id == "vintage_5s":
        negative_constraints = " (负向约束：严禁出现假脸、AI 失真、畸形五官、油光假皮肤、过度锐化、亮面磨皮、塑料质感。) "

    # ... Existing pattern replacement logic ...
    
    final_prompt = f"{final_prompt}{portrait_fusion}{negative_constraints}"
    return final_prompt
```

- [ ] **Step 3: Commit backend changes.**

### Task 2: Frontend Desktop UI Update
**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

- [ ] **Step 1: Update styles array with new names and universal placeholders.**
```javascript
  const styles = [
    { id: 'default', name: '默认风格', ... },
    { id: 'real', name: '极致写实', desc: '仿真现实模拟', ... },
    { id: 'product', name: '电商白底', desc: '纯净产品主图', ... },
    { id: 'tech_poster', name: '科技海报', desc: '高级感信息排版', ... },
    { id: 'travel', name: '旅游海报', desc: '多场景杂志长图', ... },
    { id: 'interior', name: '室内设计', desc: '空间重构方案', ... },
    { id: 'live_stream', name: '直播截图', desc: '还原带货现场', ... },
    { id: 'eri_silhouette', name: '轮廓宇宙', desc: '史诗级叙事海报', ... },
    { id: 'silk_road', name: '国风月夜', desc: '宋代山水意境', ... },
    { id: 'vintage_5s', name: 'CCD 随手抓拍', desc: 'iPhone 5s 闪光质感', icon: '📸', pts: 'Master', placeholder: '拍摄环境：【在此输入环境，如深夜小酒馆】', requiresImage: true },
    { id: 'relation_map', name: '关系图谱', desc: '作品逻辑梳理', ... },
    { id: 'encyclopedia', name: '科普百科', desc: '图鉴模块化卡片', ... }
  ];
```

- [ ] **Step 2: Commit frontend desktop changes.**

### Task 3: Frontend Mobile UI Update
**Files:**
- Modify: `frontend/src/pages/MobileHomePage.jsx`

- [ ] **Step 1: Synchronize styles array with Desktop versions.**

- [ ] **Step 2: Commit frontend mobile changes.**

### Task 4: Verification
- [ ] **Step 1: Test "CCD 随手抓拍" style.**
- [ ] **Step 2: Test "Encyclopedia" long-prompt style.**
- [ ] **Step 3: Verify the "Portrait Fusion Patch" is appended in backend logs.**
