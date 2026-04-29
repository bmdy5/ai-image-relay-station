## ADDED Requirements

### Requirement: 思维矩阵视觉反馈 (Thinking Matrix)
当用户在大师模式下开启“深度思考”并开始创作时，系统 SHALL 提供动态的视觉反馈以体现 AI 的思考过程。

#### Scenario: 神经元放电特效
- **WHEN** 任务处于生成状态且处于“大师模式”
- **THEN** 预览区 SHALL 显示呼吸感的光球，并动态喷涌出优化关键词标签（如：光影追踪、构图校准等）

### Requirement: 创作笔记悬浮卡片 (Creator's Notes)
在生图任务完成后，系统 SHALL 为大师版用户提供一份关于本次创作的深度分析报告。

#### Scenario: 悬停查看创作笔记
- **WHEN** 大师版生图完成
- **THEN** 预览区右下角 SHALL 出现一个“✦”标识，用户鼠标悬停时 SHALL 展开显示具体的 AI 优化点（如：光影增强、构图优化等）

### Requirement: 灵感演变对比 (Prompt Contrast)
系统 SHALL 允许用户查看原始提示词与 AI 深度思考后增强词之间的差异。

#### Scenario: 点击查看对比
- **WHEN** 用户在创作笔记面板中点击“查看灵感演变细节”
- **THEN** 系统 SHALL 以弹窗或展开形式展示原始 Prompt 与 AI 深度扩展后的 Prompt 对比
