## Context

首页目前在点击“生成图片”后，只有按钮进入 `generating` 状态，页面中央缺乏视觉反馈。历史页目前仅支持简单的分页拉取，无法按内容检索。

## Goals / Non-Goals

**Goals:**
- 提供沉浸式的生图 Loading 体验。
- 实现高效的历史记录关键词搜索。
- 确保在高并发点击下的接口幂等保护（前端侧）。

**Non-Goals:**
- 不支持高级搜索语法（如正则表达式）。
- 搜索逻辑暂不包含图片相似度搜索。

## Decisions

- **UI 状态锁定**：在 `generating` 期间，首页所有输入控件和提交按钮必须 `disabled`。
- **生图 Loading 组件**：在结果展示区引入一个名为 `CreationLoader` 的组件。
    - **视觉效果**：采用渐变呼吸灯背景 + 动态文字提示（如“正在捕捉灵感...”、“正在渲染光影...”）。
- **后端搜索实现**：
    - 在 `backend/crud/image.py` 中扩展查询逻辑，增加 `keyword` 过滤条件，使用 `models.ImageLog.prompt.ilike(f"%{keyword}%")`。
    - API 路由 `/api/image/history` 新增 `keyword` 查询参数。
- **前端搜索交互**：在 `HistoryPage` 顶部增加带有防抖（Debounce）逻辑的搜索框，避免用户每输入一个字符就发起网络请求。

## Risks / Trade-offs

- **[Risk] 搜索性能问题** → **Mitigation**: 限制搜索返回的分页大小，并对数据库 `prompt` 字段视情况考虑是否建立索引（目前 MVP 阶段数据量较小，暂不强制）。
