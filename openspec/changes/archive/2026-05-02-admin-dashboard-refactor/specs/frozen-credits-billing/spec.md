## MODIFIED Requirements

### Requirement: 积分两阶段冻结计费 (Frozen Credits)
系统 SHALL 采用“预占-结算”的两阶段计费模式。为了优化用户体验，在任务成功前，原始余额 `points` 必须保持不变，仅在成功后才执行最终扣款。

#### Scenario: 任务提交时的积分预占
- **WHEN** 用户提交生图任务且 `points - frozen_points >= cost`
- **THEN** 系统 SHALL 将对应积分累加至 `frozen_points` 字段，任务进入 `pending` 状态，此时 `points` 字段数值不发生变化。

#### Scenario: 任务成功后的正式扣费
- **WHEN** AI 生图成功且转存 COS 完成
- **THEN** 系统 SHALL 依次执行：`points = points - cost`，随后 `frozen_points = frozen_points - cost`，确保余额正式扣除。

#### Scenario: 任务失败后的积分释放
- **WHEN** AI 生图失败、超时或转存异常
- **THEN** 系统 SHALL 直接将 `frozen_points` 中的对应金额释放（`frozen_points = frozen_points - cost`），`points` 字段数值保持不变。
