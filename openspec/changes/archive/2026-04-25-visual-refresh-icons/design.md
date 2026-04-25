## Context

目前应用中混杂了原生 Emoji（如 🚀, 🖼, 👤）和部分硬编码的 inline-style。为了实现高级感视觉升级，需要一套统一的、可配置的图标系统。

## Goals / Non-Goals

**Goals:**
- 实现全站图标风格的一致性。
- 图标能够精准适配品牌色（#e66b33）及其透明度。
- 提升在 Retina 屏及不同操作系统下的清晰度。

**Non-Goals:**
- 不进行大规模的布局重构。
- 暂时不引入自定义字体图标或复杂的 3D 图标。

## Decisions

- **技术选型**：使用 `lucide-react`。理由：体积轻量、线性风格与本项目极简卡片式 UI 完美匹配，且支持通过 Props 动态修改 Stroke 和 Color。
- **视觉令牌 (Tokens)**：
    - **Stroke Width**: 统一设置为 `1.75`，兼顾力量感与空气感。
    - **Size**: 导航栏使用 `18px`，操作按钮使用 `20px`，大状态占位使用 `48px`。
- **色彩策略**：
    - 主要操作/高亮项：使用品牌色 `#e66b33`。
    - 辅助信息/次要导航：使用灰度值 `currentColor` (继承父级文字色 `#666`)。
- **排版微调**：图标与文字之间统一使用 `gap: 8px` 的间距。

## Risks / Trade-offs

- **[Risk] 依赖体积增加** → **Mitigation**: `lucide-react` 支持 Tree-shaking，仅打包实际使用的图标，影响极小。
- **[Risk] 视觉突兀感** → **Mitigation**: 保持图标尺寸与原有 Emoji 基本一致，重点优化线条感而非改变布局。
