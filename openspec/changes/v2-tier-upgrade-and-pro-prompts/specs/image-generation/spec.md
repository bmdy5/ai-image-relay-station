## MODIFIED Requirements

### Requirement: 极速生图接口
系统必须支持通过调用 OpenAI GPT-Image 2 接口进行绘图。为了提升用户体验，该过程 SHALL 异步处理。在发送请求前，系统必须根据 `style_id` 对用户提示词进行模版包装。

#### Scenario: 模版包装后提交任务
- **WHEN** 用户输入 "大理" 并选择 "旅游海报" 风格
- **THEN** 后端自动将其封装为完整设计指令，然后异步提交至 AI 接口进行生成
