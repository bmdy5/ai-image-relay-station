# admin-tools Specification

## Purpose
为系统管理员提供管理工具，包括用户余额手动/半自动审核调整、系统监控以及访问权限控制。

## Requirements
### Requirement: 管理员手动充值
系统必须允许管理员通过输入用户 ID 为其充值指定积分。

#### Scenario: 手动充值成功
- **WHEN** 管理员在后台提交对用户 A 充值 100 积分的请求
- **THEN** 数据库中用户 A 的 `points` 必须增加 100，且记录到 `recharge_logs` 表。

### Requirement: 管理员路由守卫
系统必须通过前端路由和后端令牌校验双重限制管理员页面访问。

#### Scenario: 非管理员非法访问
- **WHEN** 一个 `is_admin` 为 false 的用户直接在地址栏输入 `/admin`
- **THEN** 系统必须立即将其重定向至首页。

### Requirement: 审计追踪
每笔充值成功后必须记录操作人。

#### Scenario: 管理员审核
- **WHEN** 管理员 A 审核通过订单 B
- **THEN** 订单 B 的 `operator_id` 必须被标记为管理员 A 的 ID

