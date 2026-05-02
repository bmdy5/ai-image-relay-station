# UI 视觉进化 (UI Evolution) 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Visionary 平台上线“UI 视觉进化”风格，实现草图一键转高保真大厂设计稿。

**Architecture:** 通过在后端 `STYLE_PROMPT_TEMPLATES` 注入专项审计指令，并在前端 `StyleLab` 增加对应的风格卡片和图片约束实现。

**Tech Stack:** React, FastAPI, OpenAI API (via GPT-Image-2).

---

### Task 1: 后端指令引擎更新

**Files:**
- Modify: `backend/api/image.py`

- [ ] **Step 1: 在 STYLE_PROMPT_TEMPLATES 中新增 ui_upgrade 模板**

```python
# 修改 backend/api/image.py 中的 STYLE_PROMPT_TEMPLATES 字典
STYLE_PROMPT_TEMPLATES = {
    # ... 现有风格 ...
    "ui_upgrade": "你是一位资深 UI 设计师。请深度分析参考图中的 UI 布局和功能结构，你的任务是直接输出这张 UI 的视觉进化版。核心要求：1. 严禁改动布局：按钮在哪里，导航在哪里，必须保持原样。2. 视觉拉满：应用现代最高标准的 UI 审美，优化所有的间距（对齐）、圆角（统一）和阴影（多层呼吸感）。3. 组件重绘：将图中简陋的占位符图标替换为极具质感的现代矢量图标或 3D 图标。4. 材质升级：为界面加入细腻的材质，如轻微的磨砂玻璃效果、丝滑的渐变色和专业级的布光效果。请直接生成那张最完美的、高保真的、可以直接拿来做产品的 UI 设计稿。",
}
```

- [ ] **Step 2: 验证指令包装逻辑**
确保 `wrap_prompt` 函数能够正确识别并应用该模板。由于该函数已具备 `template = STYLE_PROMPT_TEMPLATES.get(style_id)` 逻辑，通常无需额外修改，只需确认新 ID 加入即可。

- [ ] **Step 3: 提交更改**
```bash
git add backend/api/image.py
git commit -m "feat(backend): add prompt template for UI Evolution style"
```

---

### Task 2: 前端交互与风格卡片集成

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

- [ ] **Step 1: 在 styles 数组中新增 ui_upgrade 配置**

```javascript
// 修改 frontend/src/pages/HomePage.jsx 中的 styles 数组
// 在旗舰梯队 (Master) 中添加：
{ 
  id: 'ui_upgrade', 
  name: 'UI 视觉进化', 
  desc: '草图一键转高保真大厂设计', 
  icon: '🪟', 
  pts: 'Master', 
  placeholder: '💡 UI 进化模式：无需输入文字。请直接上传您的 UI 截图或草图，点击“开始创作”，系统将自动分析并重构。', 
  requiresImage: true 
}
```

- [ ] **Step 2: 验证 StyleLab 渲染与约束**
点击“风格实验室”，确认“UI 视觉进化”卡片正常显示在旗舰版区域，且选中后输入框占位符同步更新。

- [ ] **Step 3: 提交并推送**
```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat(frontend): integrate UI Evolution style into Style Lab"
git push origin feature/polish-v3
```
