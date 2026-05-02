## ADDED Requirements

### Requirement: 模版变量提取与替换
后端系统必须能够识别用户提示词中的变量标签（如 `【内容】`），并将其精准替换到对应的长指令模版中。

#### Scenario: 成功替换变量
- **WHEN** 后端收到 `prompt` 为 "主题：【故宫】" 且 `style_id` 为 "eri_silhouette"
- **THEN** 后端生成包含 "故宫" 关键词的完整 500 字以上史诗海报指令

### Requirement: 模版兜底逻辑
若用户提交的提示词中未包含标准的 `【】` 标签，系统必须将用户的全部输入内容视为“主题”变量，并嵌入到选中的模版中。

#### Scenario: 兜底替换
- **WHEN** 用户直接输入 "大理" 并选择 "旅游海报" 风格
- **THEN** 系统自动将其转换为模版中的【城市名】变量并发送给 AI 模型

### Requirement: 画质后缀自动注入
针对 15 分的 Master 档位任务，系统必须自动在最终 Prompt 末尾追加预设的高级画质增强关键词。

#### Scenario: 画质增强注入
- **WHEN** 用户发起 15 积分的生成任务
- **THEN** 发送给 AI 的提示词末尾会自动包含 "8k, masterpiece, hyper-detailed" 等后缀
