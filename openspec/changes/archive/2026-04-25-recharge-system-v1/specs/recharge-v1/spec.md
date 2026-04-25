## ADDED Requirements

### Requirement: 易读随机 UID
系统必须生成一个 6 位大写字母/数字 UID。

#### Scenario: 字符排除
- **WHEN** 生成 UID 时
- **THEN** 不应包含 I, O, L, 0, 1 等易混淆字符

### Requirement: 充值档位校验
用户申请充值必须选择或输入金额，且不低于起充线。

#### Scenario: 低于起充金额
- **WHEN** 用户申请充值金额 < 10 元
- **THEN** 返回 400 错误提示“最低充值金额为 10 元”

### Requirement: 审计追踪
每笔充值成功后必须记录操作人。

#### Scenario: 管理员审核
- **WHEN** 管理员 A 审核通过订单 B
- **THEN** 订单 B 的 `operator_id` 必须被标记为管理员 A 的 ID
