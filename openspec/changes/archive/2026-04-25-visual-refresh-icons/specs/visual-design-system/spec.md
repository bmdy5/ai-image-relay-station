## ADDED Requirements

### Requirement: 图标库全面迁移 (MUST)
全站范围内的原生 Emoji 图标 MUST 被替换为基于 `lucide-react` 的矢量图标，以确保跨平台视觉一致性。

#### Scenario: 导航栏图标更新
- **WHEN** 用户访问首页或历史页
- **THEN** 顶栏的“我的创作”、“充值”等入口应显示线性图标而非 Emoji

### Requirement: 视觉风格参数化 (MUST)
所有新引入的图标组件 MUST 遵循统一的物理参数：描边宽度为 `1.75`，颜色需动态适配当前的交互状态（高亮或置灰）。

#### Scenario: 悬停颜色反馈
- **WHEN** 鼠标悬停在带有图标的导航项上
- **THEN** 图标颜色应与文字同步变为品牌橙色（#e66b33）

### Requirement: 响应式尺寸适配 (MUST)
图标 MUST 根据应用场景使用预定义的尺寸等级（如 18px, 20px, 48px），确保在不同屏幕下保持锐利。

#### Scenario: 搜索框图标对齐
- **WHEN** 渲染历史页搜索框
- **THEN** 搜索图标尺寸应为 18px，且与占位符文字垂直居中对齐
