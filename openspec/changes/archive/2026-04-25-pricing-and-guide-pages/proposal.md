## Why

目前应用已具备核心功能，但缺少明确的“价格说明”和“使用指南”，导致新用户难以快速上手，且对积分消耗规则缺乏透明度，不利于商业化转化。

## What Changes

- **新增价格页面 (PricingPage)**：展示不同生成模式的积分消耗规则，并提供 3 个阶梯式的充值套餐引导，点击可直接唤起充值弹窗。
- **新增指南页面 (GuidePage)**：采用图文结合的方式展示新手入门步骤、提示词 (Prompt) 优化公式及 FAQ。
- **全局路由集成**：在 `App.js` 中配置 `/pricing` 和 `/guide` 路由，并打通全站顶栏的跳转逻辑。

## Capabilities

### New Capabilities
- `pricing-transparency`: 实现消费规则可视化与套餐化引导。
- `user-onboarding-guide`: 实现结构化的新手教学与提示词实验室。

### Modified Capabilities
- 无

## Impact

- **Frontend**: 新增 `PricingPage.jsx` 和 `GuidePage.jsx`，修改 `App.js`, `HomePage.jsx` 和 `HistoryPage.jsx`。
