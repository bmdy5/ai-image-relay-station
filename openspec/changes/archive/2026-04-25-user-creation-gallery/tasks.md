## 1. 后端接口实现

- [x] 1.1 在 `backend/api/image.py` 中新增 `GET /history` 路由，返回当前用户的生图历史列表。
- [x] 1.2 在 `backend/crud/generation.py` 中实现数据库查询逻辑（按时间倒序，支持分页）。
- [x] 1.3 在 `backend/api/image.py` 中实现 `GET /download` 代理接口，支持流式转发远程图片。

## 2. 前端基础架构与导航

- [x] 2.1 创建 `frontend/src/pages/HistoryPage.jsx` 及其样式文件。
- [x] 2.2 在 `App.jsx` 中配置 `/history` 路由。
- [x] 2.3 在全局导航组件（如 `Sidebar.jsx` 或 Header）中添加“我的创作”入口。

## 3. 瀑布流画廊逻辑开发

- [x] 3.1 实现响应式瀑布流 UI 布局。
- [x] 3.2 对接后端接口，实现首屏加载与分页滚动逻辑。
- [x] 3.3 开发图片全屏预览 (LightBox/Modal) 组件。
- [x] 3.4 实现预览弹窗内的“一键下载”按钮逻辑，通过后端代理触发下载。

## 4. 细节优化与自检

- [x] 4.1 引入骨架屏 (Skeleton Screen) 优化图片加载体验。
- [x] 4.2 主动复查：检查 SQL 语句是否已正确归集，前端组件是否符合 MVC 极简原则。
- [x] 4.3 整体功能验证：从生图、查看历史到下载原图的完整链路测试。
