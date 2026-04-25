# frozen-credits-billing Specification

## Purpose
TBD - created by archiving change performance-ux-overhaul. Update Purpose after archive.
## Requirements
### Requirement: 积分两阶段冻结计费 (Frozen Credits)
系统 SHALL 采用“冻结-结算”的两阶段计费模式，以优化用户心理体验并防范并发风险。

#### Scenario: 任务提交时的积分冻结
- **WHEN** 用户提交生图任务且可用积分充足
- **THEN** 系统 SHALL 将对应积分从 `points` 划转至 `frozen_points` 字段，任务进入 `pending` 状态

#### Scenario: 任务成功后的正式扣费
- **WHEN** AI 生图成功且转存 COS 完成
- **THEN** 系统 SHALL 将 `frozen_points` 中的对应金额直接销账（扣除），不回退至 `points`

#### Scenario: 任务失败后的积分回退
- **WHEN** AI 生图失败、超时或转存异常
- **THEN** 系统 SHALL 将 `frozen_points` 中的对应金额原路退回至 `points`，并销账冻结额度

