## ADDED Requirements

### Requirement: 侧边栏分屏布局规范 (Split Screen Layout)
全站 SHALL 采用基于侧边栏的分屏布局，以优化创作流程的交互空间。

#### Scenario: 布局渲染
- **WHEN** 页面加载时
- **THEN** 系统 SHALL 呈现一个 400px 宽的固定侧边栏（包含所有控制项）和自适应大小的右侧预览展示区

### Requirement: 品牌视觉质感升级 (Premium Visuals)
全站 UI SHALL 统一遵循基于 Outfit 字体的现代极简视觉风格，并增加圆角和动态光效。

#### Scenario: 字体与圆角应用
- **WHEN** 渲染任何 UI 组件（如按钮、卡片、输入框）
- **THEN** 系统 SHALL 优先使用 Outfit 字体，且核心容器圆角 SHALL 保持在 20px 至 40px 之间

#### Scenario: 高级交互反馈
- **WHEN** 用户点击“开启创作”按钮
- **THEN** 按钮 SHALL 显示星芒（✦）图标，并伴随轻微的升浮阴影和缩放动效
