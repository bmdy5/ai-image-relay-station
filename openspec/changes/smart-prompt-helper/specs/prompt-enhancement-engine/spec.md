## ADDED Requirements

### Requirement: Multi-model Prompt Enhancement
系统必须提供一个接口，能够调用大语言模型（LLM）将简短的输入词润色为具备光影、细节和材质描述的高质量提示词。

#### Scenario: 成功润色中文提示词
- **WHEN** 用户发送中文提示词“一只猫”并请求优化
- **THEN** 系统返回扩充了细节（如：毛发质感、眼神、背景环境）的中文提示词

#### Scenario: 成功润色英文提示词
- **WHEN** 用户发送英文提示词“a cute cat”并请求优化
- **THEN** 系统返回扩充了细节的英文提示词

### Requirement: Language Adaptivity
润色引擎必须具备自动识别输入语言的能力，并确保输出语言与输入语言保持一致。

#### Scenario: 语种自动匹配
- **WHEN** 用户输入英文，后端接收到请求
- **THEN** 返回的 `enhanced` 提示词必须是全英文，不包含任何中文解释

### Requirement: Style Context Awareness
润色引擎在接收到可选的 `style_id` 时，必须使生成的内容符合该风格的特定艺术调性，避免产生冲突。

#### Scenario: CCD风格适配
- **WHEN** 用户选择了“CCD随手拍”风格并输入“街道”进行优化
- **THEN** 优化结果应聚焦于“闪光灯效果、写实颗粒感、夜间氛围”等符合 CCD 风格的内容
