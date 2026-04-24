# image-generation Specification

## Purpose
TBD - created by archiving change v1-launch-relay-station. Update Purpose after archive.
## Requirements
### Requirement: 极速生图接口
系统必须支持通过调用 OpenAI GPT-Image 2 接口进行实时绘图。

#### Scenario: 极速模式生成图片
- **WHEN** 用户选择“极速模式”并提交合规提示词且积分充足
- **THEN** 后端必须在 20 秒内返回生成的图片链接，并从数据库扣除对应积分

