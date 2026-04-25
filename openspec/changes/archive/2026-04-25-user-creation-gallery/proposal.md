## Why

用户目前在平台生成的图片仅能在生成后的首页看到，刷新或离开后无法找回。为了提升用户留存感并支持用户对历史创作的管理与下载，需要建立一个持久化的“我的创作”历史画廊。

## What Changes

- **新增“我的创作”页面**：采用响应式瀑布流布局展示用户过往生成的历史图片。
- **图片预览增强**：支持点击图片进入全屏预览模式，查看图片细节。
- **可靠下载功能**：引入后端下载中转接口，解决浏览器直接打开图片 URL 的跨域限制及强制下载问题。
- **加载体验优化**：引入骨架屏（Skeleton）加载状态，优化大量图片渲染时的视觉波动。

## Capabilities

### New Capabilities
- `image-history-gallery`: 提供用户历史生图记录的查询接口，并支持前端瀑布流分页展示。
- `image-download-proxy`: 提供后端资源中转，将外部图片 URL 流式转发给前端，并强制触发浏览器下载行为。

### Modified Capabilities
- 无

## Impact

- **API**: 新增 `GET /api/images/history` 和 `GET /api/images/download` 接口。
- **Frontend**: 新增 `HistoryPage.jsx` 页面，修改 `App.jsx` 路由配置，更新侧边栏或顶部导航。
- **Database**: 依赖现有的生图记录表（已在 `init.sql` 中定义），可能需要优化查询效率。
