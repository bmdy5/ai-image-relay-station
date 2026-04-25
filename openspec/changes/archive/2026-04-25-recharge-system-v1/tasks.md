## 1. 数据库与迁移

- [x] 1.1 修改 `backend/models/models.py` 字段定义。
- [x] 1.2 编写 `scripts/migrate_uid.py` 使用新的易读算法为旧用户补全 UID。

## 2. 后端开发

- [x] 2.1 完善 UID 生成工具类（排除易混淆字符并查重）。
- [x] 2.2 实现带档位校验和可选截图的报备 API。
- [x] 2.3 实现带审计日志记录的管理员审核 API（事务处理）。
- [x] 2.4 在 `backend/api/user.py` 增加 `/recharge/apply` 路由。
- [x] 2.5 在 `backend/api/admin.py` 增加 `/recharge/pending` 和 `/recharge/audit` 路由。

## 3. 前端 UI 开发

- [x] 3.1 `ProfilePage` 展示 UID 并提供充值入口。
- [x] 3.2 实现 `RechargeModal`：提供 10/50/100/500 元档位选择，支持图片上传。
- [x] 3.3 `AdminPage` 增加待审核订单列表，显示用户 UID、金额、截图预览。

## 4. 验证

- [x] 4.1 测试 UID 生成唯一性与字符集。
- [x] 4.2 测试 10 元起充限制。
- [x] 4.3 验证审核通过后积分增加且 `operator_id` 已记录。
