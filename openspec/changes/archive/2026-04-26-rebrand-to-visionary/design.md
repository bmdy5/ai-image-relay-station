## Context

当前项目处于品牌升级阶段，需要从通用的“GPT Image 2”过渡到具有独特性质的“Visionary”。前端界面在处理长图和不同屏幕比例时存在布局缺陷，需要通过技术手段增强响应式适配能力。

## Goals / Non-Goals

**Goals:**
- 将全站品牌识别统一为 "Visionary"。
- 修复生图结果预览区的布局，解决按钮折行和高度失控问题。
- 在首页底部增加一个基于 CSS Grid 的持久化优势展示区。

**Non-Goals:**
- 不涉及后端的生图引擎算法修改。
- 不涉及数据库 Schema 的变更。

## Decisions

- **布局方案**：
    - 使用 `calc(100vh - offset)` 动态计算预览区最大高度，确保底部下载/编辑按钮始终在可视范围内。
    - 图片元素强制应用 `object-fit: contain` 以保持原比例显示而不撑开容器。
    - 按钮容器使用 `flex-wrap: nowrap` 并配合 `min-width` 确保文字不折行。
- **展示区设计**：
    - 采用现代的 Bento Grid（便当盒）布局风格，展示 4 大核心优势。
    - 使用 Lucide-react 图标库增强视觉识别。
    - 背景采用微弱的渐变色以区分生图区和介绍区。

## Risks / Trade-offs

- **[Risk]** 图片比例极端导致按钮被推至底部看不到。
    - **[Mitigation]** 为预览容器设置 `overflow-y: auto` 和明确的 `max-height`。
- **[Trade-off]** 首页内容变多。
    - **[Mitigation]** 采用模块化布局，确保生图主操作区依然占据视觉中心。
