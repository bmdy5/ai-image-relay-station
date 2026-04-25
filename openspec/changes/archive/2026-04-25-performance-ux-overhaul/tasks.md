## 1. 后端：核心逻辑与性能优化

- [x] 1.1 在 `backend/models/models.py` 的 `User` 模型中增加 `frozen_points` 字段，并执行数据库迁移（或手动更新数据库文件）。
- [x] 1.2 重构 `backend/api/image.py` 中的 `process_image_task`：实现“积分冻结 -> AI 生成 -> 结算/回滚”的闭环逻辑。
- [x] 1.3 优化 `process_image_task` 的数据库连接，在 AI 耗时调用期间释放会话。
- [x] 1.4 在 `process_image_task` 中引入重试逻辑（针对图片下载与转存）。
- [x] 1.5 使用 `anyio.to_thread.run_sync` 包装 COS 的同步 SDK 调用。

## 2. 前端：首页（生成与进度）

- [x] 2.1 修改 `HomePage.jsx`，在任务提交成功后，立即弹出 Toast 提示：“任务已提交，您可以留在本页或前往‘我的创作’查看结果。”
- [x] 2.2 优化 `HomePage.jsx` 中的进度条逻辑，从随机模拟改为基于后端状态的分段映射。

## 3. 前端：我的创作（实时占位与加载优化）

- [x] 3.1 在 `HistoryPage.jsx` 中实现对 `pending` 状态记录的特殊渲染：毛玻璃效果占位卡 + Prompt 文字 + Loading 动画。
- [x] 3.2 在 `HistoryPage.jsx` 中对 `pending` 状态记录执行短频次轮询（如 5s），直到状态变为 `success`。
- [x] 3.3 修改图片加载逻辑，直接使用 `image_url`，并拼接 COS 数据万象（CI）缩略图参数。
- [x] 3.4 在图片加载过程中，利用缩略图参数实现“模糊预览 -> 高清渲染”的 LQIP 效果。

## 4. 验证与复查

- [ ] 4.1 验证全链路生图流程，特别是背景任务运行期间数据库连接池的状态。
- [ ] 4.2 运行 `code_compliance_check` 技能审查后端代码。
- [ ] 4.3 确认画廊页面在多图并发加载下的性能表现。
