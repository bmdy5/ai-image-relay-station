# 新手引导系统执行计划 (New User Tutorial Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个交互式的 5 步新手引导系统，帮助用户熟悉生图、润色及积分获取流程。

**Architecture:** 采用 React Portal 实现全屏遮罩，结合 `useCallback` 和 `getBoundingClientRect` 动态定位高亮区域，使用 Context API 全局管理引导状态。

**Tech Stack:** React, Lucide React (Icons), Vanilla CSS, LocalStorage.

---

### Task 1: 基础引导组件与样式
**Files:**
- Create: `frontend/src/components/TutorialOverlay.jsx`
- Create: `frontend/src/components/TutorialOverlay.css`

- [ ] **Step 1: 创建样式文件**
```css
/* frontend/src/components/TutorialOverlay.css */
.tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.7);
  pointer-events: auto;
}

.tutorial-highlight {
  position: absolute;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 107, 0, 0.5);
  border-radius: 8px;
  transition: all 0.3s ease;
  pointer-events: none;
}

.tutorial-tooltip {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid #C59C8F;
  border-radius: 16px;
  padding: 16px;
  width: 280px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 10000;
  transition: all 0.3s ease;
}
```

- [ ] **Step 2: 实现基础 React 组件**
实现能够根据传入的 `rect` 渲染高亮块和气泡的组件。

- [ ] **Step 3: 提交代码**
```bash
git add frontend/src/components/TutorialOverlay.*
git commit -m "feat: add TutorialOverlay base component and styles"
```

### Task 2: 状态管理与上下文 (Context)
**Files:**
- Create: `frontend/src/context/TutorialContext.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: 实现 TutorialProvider**
管理 `currentStep`, `isActive`, `finishTutorial` 等状态。

- [ ] **Step 2: 在 App.jsx 中包裹 Provider**
确保全局可用。

- [ ] **Step 3: 提交代码**
```bash
git add frontend/src/context/TutorialContext.jsx frontend/src/App.jsx
git commit -m "feat: implement TutorialContext for state management"
```

### Task 3: 步骤定义与 DOM 锚点
**Files:**
- Modify: `frontend/src/pages/HomePage.jsx` (PC & Mobile 共享逻辑)
- Modify: `frontend/src/components/PCLayout.jsx`
- Modify: `frontend/src/components/MobileLayout.jsx`

- [ ] **Step 1: 在页面组件中添加 ID 锚点**
为输入框、风格列表、生成按钮、历史 Tab 添加 `id="guide-xxx"`。

- [ ] **Step 2: 配置 5 个步骤的元数据**
在 Context 中定义步骤序列。

- [ ] **Step 3: 提交代码**
```bash
git commit -am "feat: add DOM anchors for tutorial steps"
```

### Task 4: 逻辑集成与多端适配
**Files:**
- Modify: `frontend/src/context/TutorialContext.jsx`

- [ ] **Step 1: 实现坐标捕获逻辑**
使用 `requestAnimationFrame` 或 `resize` 监听器确保高亮位置准确。

- [ ] **Step 2: 实现“一键润色”教学逻辑**
在第一步展示润色功能提示。

- [ ] **Step 3: 提交代码**
```bash
git commit -am "feat: integrate tutorial logic with responsive support"
```

### Task 5: 最终润色与自动触发
**Files:**
- Modify: `frontend/src/context/TutorialContext.jsx`

- [ ] **Step 1: 实现 LocalStorage 检查**
判断用户是否为新用户且未完成引导。

- [ ] **Step 2: 完善动画与“跳过”功能**

- [ ] **Step 3: 最终提交**
```bash
git commit -am "feat: finalize tutorial system with skip and auto-trigger"
```
