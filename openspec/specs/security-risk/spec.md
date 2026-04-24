# security-risk Specification

## Purpose
TBD - created by archiving change v1-launch-relay-station. Update Purpose after archive.
## Requirements
### Requirement: 消费总额熔断
系统必须支持设置单日全站 API 消费上限。

#### Scenario: 达到单日限额停止服务
- **WHEN** 今日全站生图消耗的 API 总金额达到预设的熔断线（如 $50）
- **THEN** 系统必须暂时停止所有生图请求，并向所有用户提示“系统维护中”。

### Requirement: 提示词敏感词拦截
系统必须在调用 OpenAI 之前拦截包含违规词汇的提示词。

#### Scenario: 命中敏感词拦截
- **WHEN** 用户输入的提示词包含系统预设的违规词汇
- **THEN** 系统必须拦截该请求，不调用外部 API，并提示“词汇违规”。

