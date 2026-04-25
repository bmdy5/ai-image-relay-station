# image-generation-feedback Specification

## Purpose
TBD - created by archiving change experience-enhancement. Update Purpose after archive.
## Requirements
### Requirement: 状态锁定 (MUST)
在调用图片生成接口期间，系统 MUST 禁用“生成图片”按钮及所有的配置输入控件（如提示词输入框、规格选择等），防止用户修改参数或造成重复请求。

#### Scenario: 锁定生效
- **WHEN** 用户点击“生成图片”
- **THEN** 按钮变为不可点击状态，输入框变为只读，直到请求结束或失败

### Requirement: 视觉反馈 (MUST)
在图片生成期间，系统 MUST 在原本展示结果的区域显示真实的任务进度或阶段反馈。

#### Scenario: 展示分段进度反馈
- **WHEN** 任务处于不同阶段（Pending/Generating/Storing）
- **THEN** 前端进度条 SHALL 根据后端反馈的状态进行分段映射（如：提交成功 10%，AI 生成中 50%，转存中 80%，完成 100%）

