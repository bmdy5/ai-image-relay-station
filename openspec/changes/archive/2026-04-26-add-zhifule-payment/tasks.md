## 1. 环境准备与数据模型升级

- [x] 1.1 更新 `.env` 文件，填入支付乐 PID、KEY 以及回调地址
- [x] 1.2 修改 `backend/models/models.py` 中的 `RechargeLog` 模型，增加 `out_trade_no` 和 `trade_no` 字段
- [x] 1.3 运行数据库同步（由于项目未使用 alembic，需手动更新 SQLite 或提醒用户重启应用以重新初始化）

## 2. 后端核心服务实现

- [x] 2.1 创建 `backend/core/payment.py`，实现易支付标准的 MD5 签名生成算法
- [x] 2.2 在 `backend/core/payment.py` 中实现跳转支付链接的构造逻辑

## 3. 支付 API 接口开发

- [x] 3.1 创建 `backend/api/payment.py`，实现 `POST /api/payment/create` 接口（创建待支付记录并返回链接）
- [x] 3.2 实现 `GET /api/payment/notify` 接口（接收并验证支付乐回调，成功则给用户加分）
- [x] 3.3 实现 `GET /api/payment/status/{out_trade_no}` 接口（供前端查询支付状态）
- [x] 3.4 在 `api/index.py` 中注册支付路由

## 4. 前端页面改造

- [x] 4.1 修改 `RechargeModal.jsx`，增加“在线支付”选项，并调用后端接口获取支付跳转链接
- [x] 4.2 在支付窗口实现简单轮询（Polling），实时检测支付是否到账并反馈给用户

## 5. 联调测试

- [x] 5.1 模拟支付回调测试，验证签名校验和积分加算逻辑是否准确
- [x] 5.2 全链路跑通，确保从点击充值到积分到账的闭环
