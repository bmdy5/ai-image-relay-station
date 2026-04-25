## MODIFIED Requirements

### Requirement: 积分扣减逻辑
系统必须根据“分辨率”与“质量档位”的组合自动扣除对应积分。

#### Scenario: 512px 积分扣减
- **WHEN** 用户生成一张 512px 规格的图片（Low: 1 / Med: 2 / High: 5）
- **THEN** 系统必须准确计算组合分值，并在请求下发前执行扣除。

#### Scenario: 1024px 积分扣减
- **WHEN** 用户生成一张 1024px 规格的图片（Low: 2 / Med: 4 / High: 10）
- **THEN** 系统必须准确计算组合分值，并在请求下发前执行扣除。

#### Scenario: 2048px 积分扣减
- **WHEN** 用户生成一张 2048px 规格的图片（Low: 5 / Med: 10 / High: 25）
- **THEN** 系统必须准确计算组合分值，并在请求下发前执行扣除。
