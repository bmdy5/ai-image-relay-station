## Why

系统目前在图片生成阶段缺乏足够的视觉反馈，用户无法确认任务进度，且容易误触发重复生成。同时，随着历史数据增加，用户难以快速定位特定的历史创作。

## What Changes

- **生图反馈增强**：在首页点击生成后，输入框区域或结果展示区进入 Loading 状态（展示动画或占位图），并同步禁用“生成”按钮以防止重复点击。
- **历史记录搜索**：在“我的创作”页面新增搜索组件，支持用户通过输入关键词实时筛选历史生图记录。

## Capabilities

### New Capabilities
- `image-generation-feedback`: 定义生图任务执行期间的 UI 锁定逻辑与 Loading 占位行为。
- `history-search`: 定义历史创作记录的关键词检索协议（含后端接口支持）。

### Modified Capabilities
- 无

## Impact

- **Frontend**: 涉及 `HomePage.jsx` 的状态管理与 `HistoryPage.jsx` 的组件库扩展。
- **Backend**: 修改 `api/image.py` 与 `crud/image.py` 以支持带 `keyword` 参数的条件查询。
