## ADDED Requirements

### Requirement: 图像尺寸动态调整
系统必须能够根据用户选择的分辨率参数，对 OpenAI 生成的原始图像进行缩放处理。

#### Scenario: 512px 降采样处理
- **WHEN** 用户选择 512px 分辨率并成功生成图像
- **THEN** 后端使用 Pillow 库将图像等比例缩小至 512x512 像素并保存

#### Scenario: 2048px 像素增强处理
- **WHEN** 用户选择 2048px 分辨率并成功生成图像
- **THEN** 后端使用 Pillow 库配合高质量插值算法（LANCZOS）将图像放大至 2048x2048 像素并保存

### Requirement: AI 像素增强标注
前端 UI 在涉及 2048px 选项时，必须显示明确的技术说明标注。

#### Scenario: 标注显示
- **WHEN** 用户打开分辨率选择下拉框或面板
- **THEN** 在 2048px 选项旁显示“AI 像素增强”文本标签
