## ADDED Requirements

### Requirement: 异步任务提交引导
系统在用户点击“生成”按钮后，SHALL 立即提供反馈，明确告知任务已在后台执行。

#### Scenario: 任务提交成功的 UI 提示
- **WHEN** 用户点击生成并成功获得任务 ID
- **THEN** 界面 SHALL 弹出提示（Toast/Message），告知用户“任务已提交，您可以留在本页或前往‘我的创作’查看结果”
