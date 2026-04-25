# credits-system Specification

## Purpose
TBD - created by archiving change v1-launch-relay-station. Update Purpose after archive.
## Requirements
### Requirement: 积分扣减逻辑
系统必须根据生图质量规格自动扣除对应积分。

#### Scenario: 积分扣减成功
- **WHEN** 用户生成一张“中质量”图片（对应 10 积分）
- **THEN** 系统必须将该用户的余额减 10，并在 `image_logs` 中记录消耗。

### Requirement: 余额不足拦截
系统必须在积分不足时禁止生图。

#### Scenario: 余额不足提示
- **WHEN** 用户余额为 5 且尝试生成 10 积分的“中质量”图片
- **THEN** 系统必须返回 403 错误，并弹出充值引导引导。

### Requirement: 充值档位校验
用户申请充值必须选择或输入金额，且不低于起充线。

#### Scenario: 低于起充金额
- **WHEN** 用户申请充值金额 < 10 元
- **THEN** 返回 400 错误提示“最低充值金额为 10 元”

