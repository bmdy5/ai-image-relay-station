## ADDED Requirements

### Requirement: 风格图片约束校验
前端系统必须根据所选风格的 `requiresImage` 属性，强制检查用户是否已上传参考图。

#### Scenario: 缺失图片拦截
- **WHEN** 用户选择 "iPhone 5s 纪实" 风格且未上传图片
- **THEN** "立即生成" 按钮变灰，并显示 "✨ 此风格需要上传图片以获得最佳效果" 提示

### Requirement: 中高级档位开启参考图参数
当生成任务属于 10 积分（中级）或 15 积分（高级）时，后端必须在 API 调用中携带用户上传的图片 URL 作为参考参数。

#### Scenario: 携带图片参数
- **WHEN** 15 积分任务包含有效的 `image_url`
- **THEN** 后端向模型发送带有 `image_url` 或对应参考参数的请求
