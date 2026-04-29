## Context

当前系统采用单一纵向布局，视觉风格较为传统且功能堆叠感强。通过 `scratch/pro_design_v2.html` 原型，我们已经验证了一套基于侧边栏控制的高级感 UI 方案。

## Goals / Non-Goals

**Goals:**
- 实现侧边栏 (400px) + 右侧预览区的分屏布局。
- 实现基于 Tier (Standard, HD, Master) 的动态 UI 门控。
- 实现“风格实验室”模态弹窗及多风格切换逻辑。
- 为大师模式注入“思维矩阵”和“创作笔记”视觉特效。
- 遵循 Mockup 中的字体 (Outfit)、圆角和配色规范。

**Non-Goals:**
- 不涉及后端 API 协议或逻辑的修改。
- 不修改页面底部的“介绍”文本内容。
- 暂时不进行移动端响应式深度适配（优先保证桌面端体验）。

## Decisions

- **Decision 1: 使用 CSS Grid 进行全局布局**。
    - **Rationale**: Grid 是实现固定侧边栏 + 自适应主区域最简洁、性能最好的方案。
- **Decision 2: 保持 Vanilla JS 状态驱动 UI**。
    - **Rationale**: 现有项目基于原生 JS，引入框架会增加复杂度。我们将通过一个简单的 `currentTier` 和 `selectedStyle` 状态变量来驱动所有 UI 变化。
- **Decision 3: 采用 CSS Keyframes 实现粒子与光球特效**。
    - **Rationale**: CSS 动画性能优于 JS 动画，且能够轻松实现“思维矩阵”所需的模糊和缩放效果。
- **Decision 4: 自定义叠加层 (Overlay) 实现模态弹窗**。
    - **Rationale**: 相比于原生的 `<dialog>`，自定义 Overlay 能更好地控制毛玻璃 (backdrop-filter) 和入场动画效果。

## Risks / Trade-offs

- **[Risk] 样式冲突** → **Mitigation**: 在重构布局前，先清理 `index.html` 中的旧布局 CSS，确保新的侧边栏样式不被全局样式干扰。
- **[Risk] 特效性能负载** → **Mitigation**: 限制粒子数量（如 8-12 个）并使用 `will-change` 优化性能。
