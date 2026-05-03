## Context

本项目追求极致的视觉体验。在引入 AI 提示词润色时，简单的 Loading 圈已无法满足品牌调性。我们需要一种既能体现 AI “黑盒运算”神秘感，又能保证用户操作确定性的方案。

## Goals / Non-Goals

**Goals:**
- 实现非流式的快速文本转换，降低交互复杂性。
- 通过 CSS Shimmer 动画建立“AI 正在思考”的视觉隐喻。
- 确保语言对齐与风格对齐。

## Decisions

### 1. 助手角色与语言自适应
- **逻辑**: 通过 System Prompt 让 LLM 识别输入语种并对等回复，保持“润色助手”身份。

### 2. 呼吸灯边框动画 (Aesthetic Choice)
- **技术**: 使用 `border-image` 或伪元素渐变动画。当 `enhancing` 为真时，输入框外圈出现流动的、符合品牌色调（如橙/铜色系）的渐变光带。

### 3. 撤销逻辑与状态管理
- **状态**: `originalPrompt` (String) 存储优化前的快照。
- **逻辑**: 每次成功点击“优化”，先存快照，再更新主 Prompt。

### 4. 风格切换的确认拦截
- **逻辑**: 在切换 Style 的 Action 之前增加 `if (prompt.trim()) { confirm(...) }` 逻辑。

## Risks / Trade-offs

- **[Risk] 动画性能消耗** -> [Mitigation] 使用 `transform` 或 `background-position` 等高性能 CSS 属性，避免触发大规模重排。
- **[Risk] 用户对 AI 结果不满** -> [Mitigation] 显眼的“恢复原句”按钮作为安全出口。
