## ADDED Requirements

### Requirement: 跨页面 Prompt 导出 (MUST)
系统 MUST 允许用户在历史画廊中选中特定图片的 Prompt，并将其安全地存储在 `sessionStorage` 中以备后续跳转使用。

#### Scenario: 触发复用操作
- **WHEN** 用户点击图片上的“复用”按钮
- **THEN** 系统将 Prompt 写入 `pending_prompt` 键值并跳转至首页 `/`

### Requirement: 首页 Prompt 自动填充 (MUST)
首页在加载时 MUST 检测是否存在待处理的 Prompt 缓存，若存在则将其填入生图输入框。

#### Scenario: 自动填入成功
- **WHEN** 用户从画廊跳转回首页且 storage 中有有效 Prompt
- **THEN** 首页输入框显示该 Prompt，且系统立即清除 storage 中的该键值

### Requirement: 填充逻辑单次生效 (MUST)
自动填充行为 MUST 是幂等的且仅触发一次，用户手动刷新首页时不应再次触发填充。

#### Scenario: 刷新不重复填充
- **WHEN** 用户已完成一次自动填充并手动刷新页面
- **THEN** 输入框不应再次从 storage 获取内容（因为已被清除）
