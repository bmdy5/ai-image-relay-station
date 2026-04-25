## ADDED Requirements

### Requirement: 状态锁定 (MUST)
在调用图片生成接口期间，系统 MUST 禁用“生成图片”按钮及所有的配置输入控件（如提示词输入框、规格选择等），防止用户修改参数或造成重复请求。

#### Scenario: 锁定生效
- **WHEN** 用户点击“生成图片”
- **THEN** 按钮变为不可点击状态，输入框变为只读，直到请求结束或失败

### Requirement: 视觉反馈 (MUST)
在图片生成期间，系统 MUST 在原本展示结果的区域显示一个明显的 Loading 动画或占位卡片。

#### Scenario: 展示 Loading 动画
- **WHEN** 生图请求发起后
- **THEN** 结果展示区显示带有“正在渲染中...”字样的动画组件
