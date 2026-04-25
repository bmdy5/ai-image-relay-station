## Why

当前界面大量使用系统原生 Emoji 替代图标，导致视觉风格不统一、跨平台显示差异大，且缺乏工业级的精致感。

## What Changes

- **图标库迁移**：引入 `lucide-react` 图标库，全面替换全站的 Emoji 图标。
- **视觉令牌优化**：统一图标的线条粗细（Stroke Width）、尺寸（Size）及主色调（#e66b33），确保图标与文字排版和谐共存。
- **UI 组件重构**：更新导航栏、按钮、状态占位符及模态框中的图标显示逻辑。

## Capabilities

### New Capabilities
- `visual-design-system`: 定义基础图标组件的使用标准，包括默认尺寸、描边权重及响应式配色。

### Modified Capabilities
- 无

## Impact

- **Frontend**: 涉及 `HomePage.jsx`, `HistoryPage.jsx`, `ProfilePage.jsx`, `AdminPage.jsx` 等核心视图。
- **Dependencies**: 需新增安装 `lucide-react`。
