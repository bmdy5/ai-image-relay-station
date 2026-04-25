## MODIFIED Requirements

### Requirement: 极速生图接口
系统必须支持通过调用 OpenAI API 进行实时绘图，并透传分辨率与画质参数。

#### Scenario: 多维度规格生成图片
- **WHEN** 用户选择指定的分辨率和质量，并提交合规提示词且积分充足
- **THEN** 后端必须根据映射表配置 OpenAI 请求参数（如 `quality: hd`），并在完成后执行必要的图像二次处理。
