## ADDED Requirements

### Requirement: 动态参数分发
系统必须根据用户请求中的 `quality` 字段（standard/hd/master），动态映射并分发相应的模型参数。

#### Scenario: 标准版请求
- **WHEN** 用户选择“标准版”提交生图任务
- **THEN** 系统向 API 发送 `model: "gpt-image-2"`, `size: "1024x1024"` 且不含质量增强参数

#### Scenario: 高清版请求
- **WHEN** 用户选择“高清版”提交生图任务
- **THEN** 系统向 API 发送 `model: "gpt-image-2"`, `size: "1024x1536"`

#### Scenario: 大师版请求
- **WHEN** 用户选择“大师版”提交生图任务
- **THEN** 系统向 API 发送 `model: "gpt-image-2"`, `size: "1024x1792"`, 且包含 `quality: "hd"` 参数

### Requirement: 前端 UI 功能解锁
系统必须移除 `HomePage.jsx` 中针对高级生图规格和编辑功能的禁用逻辑。

#### Scenario: 用户选择规格
- **WHEN** 用户进入首页
- **THEN** “高清版”和“大师版”按钮应当显示为可选状态，而非置灰状态

#### Scenario: 结果页继续编辑
- **WHEN** 生图任务成功返回结果
- **THEN** “🚀 继续编辑”按钮应当呈现激活状态（虽然目前暂不跳转，但视觉上需表现为可用）
