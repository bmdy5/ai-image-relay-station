## 1. 数据库底座升级 (Database)

- [x] 1.1 修改 `backend/models/models.py`，为 `ImageLog` 增加 `points_snapshot`（记录当时单次积分价值）字段。
- [x] 1.2 为 `ImageLog` 增加索引，提升按 `created_at` 统计大数据的速度。

## 2. 积分结算逻辑重构 (Backend Core)

- [x] 2.1 重写 `backend/api/image.py` 中的 `generate_image` 接口，改为仅增加 `frozen_points` 而不减少 `points`。
- [x] 2.2 重写 `process_image_task` 中的成功处理逻辑：执行 `points -= cost` 并扣除 `frozen_points`。
- [x] 2.3 优化失败处理逻辑：仅减少 `frozen_points`，保持 `points` 不变。

## 3. 管理员统计接口 (Admin API)

- [x] 3.1 在 `backend/api/admin.py` 实现 `GET /admin/dashboard/stats` 接口，支持时间范围聚合。
- [x] 3.2 实现 `GET /admin/styles` 接口，从后端动态返回所有风格及其使用计数。
- [x] 3.3 实现 `DELETE /admin/image/{id}/wipe` 接口，支持物理删除数据库记录及 COS 图片。

## 4. 管理员前端重构 (Frontend UI)

- [x] 4.1 重构 `AdminPage.jsx` 整体布局，引入 `Dashboard` 标签页作为默认首页。
- [x] 4.2 开发可视化统计卡片 (Total Users, Total Revenue, Total Points Consumed)。
- [x] 4.3 开发“全站全息流”监控墙组件，支持 Prompt 预览与一键抹除。
- [x] 4.4 开发“利润计算器”组件，支持手动输入 API 成本并生成损益对比表。
- [x] 4.5 适配移动端 Dashboard 布局，确保关键指标在手机上清晰可见。
