## ADDED Requirements

### Requirement: Rate Limiting for Prompt Enhancement
系统必须对提示词优化接口进行频率控制，以防止 API 资源被恶意消耗。

#### Scenario: 正常频率调用
- **WHEN** 用户在一分钟内第 3 次点击优化按钮
- **THEN** 系统正常返回优化后的结果

#### Scenario: 触发限流
- **WHEN** 用户在一分钟内连续第 6 次点击优化按钮
- **THEN** 系统返回 429 错误状态码，并提示“操作过于频繁，请稍后再试”
