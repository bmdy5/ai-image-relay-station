## Context

项目需要一套兼顾易用性与安全性的手动对账充值方案。

## Goals / Non-Goals

**Goals:**
- 生成 6 位易读随机 UID（排除 I, O, L）。
- 提供金额档位选择（10元起），系统自动换算积分。
- 支持可选的支付截图上传。
- 实现完整的管理员审核审计日志。

**Non-Goals:**
- 暂不实现自动撤回（由管理员/客服人工处理）。

## Decisions

1.  **UID 算法**：
    *   字符集：`23456789ABCDEFGHJKMNPQRSTWXYZ`（29个字符，无易混淆项）。
    *   长度：6位。
    *   生成逻辑：随机选择，循环查重直至唯一。
2.  **金额与积分换算**：
    *   比例设定（示例）：1元 = 10积分。
    *   档位：10元 (100分), 50元 (500分), 100元 (1000分), 500元 (5000分)。
3.  **数据库变更**：
    *   `users`: `uid` (String(6), unique, index)。
    *   `recharge_logs`: 
        *   `money_amount`: `Numeric` (实际支付金额)。
        *   `status`: `pending`, `success`, `rejected`。
        *   `screenshot_url`: `String` (可选图片路径)。
        *   `operator_id`: 记录操作管理员。
4.  **接口逻辑**：
    *   `POST /api/user/recharge/apply`：接收 `money_amount` 和 `screenshot_url`。
    *   `POST /api/admin/recharge/audit/{id}`：执行时开启事务，更新 Log 状态并原子增加 User 积分。

## Risks / Trade-offs

- **文件存储**：截图需要存储位置。
    - **权衡**：由于是 MVP，暂时允许前端传图片 Base64 存数据库 Text 字段，或者配置一个简单的本地静态文件目录。建议先存 URL 占位，后期接 OSS。
- **安全**：必须校验 `money_amount >= 10`。
