## ADDED Requirements

### Requirement: 数据可视化 API
后端必须提供支持多维度（用户数、流水、消耗）的时间序列统计 API，供管理员仪表盘调用。

#### Scenario: 请求趋势数据
- **WHEN** 管理员仪表盘请求过去 7 天的生图成功率数据
- **THEN** 系统按天返回 `success` 与 `failed` 的计数值数组。

### Requirement: 动态风格统计
系统必须能够根据 `ImageLog` 中的 `style` 字段自动聚合并返回各风格的点击排行，而非依赖硬编码配置。

#### Scenario: 获取热门风格排行
- **WHEN** 管理员打开仪表盘
- **THEN** 系统返回当前全站使用次数最多的前 10 个 style ID 及其使用频率。
