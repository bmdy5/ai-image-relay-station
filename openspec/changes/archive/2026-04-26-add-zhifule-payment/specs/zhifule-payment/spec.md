## ADDED Requirements

### Requirement: 支付订单创建
系统 MUST 能够根据用户选择的金额创建一个支付订单。订单 MUST 包含唯一的商户订单号 (`out_trade_no`)，并按照“支付乐”协议进行 MD5 签名。

#### Scenario: 成功生成支付跳转链接
- **WHEN** 用户在前端选择充值 10 元并点击支付
- **THEN** 后端生成订单记录，返回带签名的“支付乐”跳转 URL

### Requirement: 异步通知回调处理
系统 MUST 提供一个公开的 API 接口来接收“支付乐”的异步支付通知。系统 MUST 验证签名的真实性，并核对订单金额。

#### Scenario: 收到回调并自动加分
- **WHEN** 支付乐发送 GET 请求到通知接口，且 `trade_status` 为 `TRADE_SUCCESS`
- **THEN** 后端验证签名通过，将对应订单状态改为 `success`，并根据金额自动增加该用户的 `points` 余额。

### Requirement: 订单状态轮询
系统 MUST 允许前端查询特定订单的状态，以便在支付成功后立即更新 UI。

#### Scenario: 用户支付后 UI 自动刷新
- **WHEN** 前端轮询接口发现订单状态已变为 `success`
- **THEN** 弹窗自动关闭，并提示“充值成功”，同时刷新用户当前积分。
