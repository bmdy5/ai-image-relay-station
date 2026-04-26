## Why

当前“GPT Image 2”品牌名较为通用，缺乏辨识度。同时，现有的前端布局在处理长图时会出现比例失调和按钮折行问题。我们需要通过品牌重塑（Visionary）和 UI 精细化调整，提升产品的专业感和用户转化率，将“自由计费、无需翻墙”等核心竞争优势持久地展示给用户。

## What Changes

- **品牌重塑**：全站更名为 "Visionary"，副标题标注 "基于 GPT Image V2 构建"。
- **UI 布局优化**：
    - 修复结果预览区的 `max-height` 和 `object-fit` 逻辑，确保各种尺寸图片都能完美适配。
    - 修复底部操作按钮在文字较长时的折行问题，提升对齐精度。
- **核心优势展示区**：在首页底部新增一个极具现代感的特性看板，整合海报文案（自由计费、无需翻墙、无限制创作、零风控门槛）。

## Capabilities

### New Capabilities
- `branding-visionary`: 全站视觉品牌更新与 Logo 替换。
- `layout-optimization-v2`: 生图预览区与操作按钮的布局适配优化。
- `landing-feature-showcase`: 首页底部持久化的核心优势展示模块。

### Modified Capabilities
- 无

## Impact

- `frontend/src/pages/HomePage.jsx`: 主要布局逻辑与文案修改。
- `frontend/src/api/request.js`: （如有必要）更新请求头或基础配置。
- `backend/api/image.py`: 确保性能日志与新品牌一致。
