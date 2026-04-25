## MODIFIED Requirements

### Requirement: 极速生图接口
系统必须支持通过调用 OpenAI GPT-Image 2 接口进行绘图。为了提升用户体验，该过程 SHALL 异步处理。

#### Scenario: 异步模式提交任务
- **WHEN** 用户选择图片规格并提交合规提示词且积分充足
- **THEN** 后端 SHALL 立即返回任务 ID (`pending` 状态)，并启动后台任务进行 AI 生成、转存与扣费

#### Scenario: 数据库连接优化
- **WHEN** 后台任务调用耗时较长的 AI 接口期间
- **THEN** 系统 SHALL 释放当前数据库连接，直到 AI 接口返回结果后再重新获取连接更新状态
