## Context

目前生图功能已经稳定，图片 URL（多为外部 CDN）存储在 `generation_logs` 表中。用户需要一个集中的展示空间来查看和管理这些作品。

## Goals / Non-Goals

**Goals:**
- **响应式瀑布流**：在不同屏幕尺寸下都能优雅展示图片。
- **稳定下载**：通过后端中转绕过 CDN 的 `Content-Security-Policy` 或 `CORS` 限制，确保“一键下载”。
- **预览体验**：提供平滑的放大查看效果。
- **性能优化**：使用骨架屏减少首屏加载时的视觉抖动。

**Non-Goals:**
- 图片删除、重命名或分类功能（本阶段暂不实现）。
- 历史记录的全文搜索功能。
- 图片编辑接口集成。

## Decisions

- **UI 框架选择**：使用 CSS 原生 `columns` 或 `grid` 配合 `aspect-ratio` 实现瀑布流，减少第三方库依赖。
- **下载中转逻辑**：后端使用 `httpx` 或 `requests` 流式请求原图，将响应流直接 pipe 给前端，并设置 `Content-Disposition: attachment; filename=...`。
- **状态管理**：使用现有的 `axios` 拦截器处理分页请求。
- **路由方案**：在 `App.jsx` 中新增 `/history` 路径。

## Risks / Trade-offs

- **[Risk] 瀑布流布局错位** → **Mitigation**: 在图片未加载完成前，通过后端返回的尺寸信息（或默认比例）预留 `aspect-ratio` 容器，配合骨架屏。
- **[Risk] 后端带宽压力** → **Mitigation**: 代理仅用于“下载”操作，普通的“查看”依然直接请求 CDN URL。
- **[Risk] 大量图片导致 DOM 压力** → **Mitigation**: 本阶段采用基础的分页加载，后续可优化为虚拟滚动。
