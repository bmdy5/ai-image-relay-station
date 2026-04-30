## Why

当前 `ProfilePage` (个人中心) 和 `PricingPage` (价格页) 采用移动端优先的设计，在 PC 端通过简单的拉伸适配，导致 UI 比例失调（如卡片过长、文字过疏），且在 PC 环境下触发了一些交互 Bug（如名字不显示、点击区域偏移）。为了提升 PC 端用户的专业体验，同时保护已经稳定运行的移动端 UI，需要将这两个页面的 PC 和 Mobile 逻辑进行彻底物理隔离。

## What Changes

- **代码架构升级**：引入 Dispatcher (调度器) 模式。原本的 `ProfilePage.jsx` 和 `PricingPage.jsx` 将演变为路由分发层，根据设备类型（`isMobile`）加载对应的 PC 或 Mobile 组件。
- **UI 物理隔离**：
    - 将现有逻辑迁移至 `MobileProfilePage.jsx` 和 `MobilePricingPage.jsx`。
    - 为 PC 端新建 `PCProfilePage.jsx` 和 `PCPricingPage.jsx`，采用宽屏优化的多栏布局。
- **Bug 修复**：在 PC 版重构过程中，修复个人中心名字显示异常的问题，并优化 PC 端的点击/悬浮交互。

## Capabilities

### New Capabilities
- `pc-optimized-ui`: 针对大屏设备优化的布局系统，包括多栏布局、更精细的阴影和悬浮效果。

### Modified Capabilities
- `user-profile`: 修改个人中心的需求，增加 PC 端的展示逻辑。
- `pricing-system`: 修改价格页需求，增加 PC 端的栅格化展示逻辑。

## Impact

- **Affected Files**: `ProfilePage.jsx`, `PricingPage.jsx`, `App.jsx`。
- **Dependencies**: 依然依赖现有的 `api/request` 和 `RechargeModal` 组件，但 UI 层将完全重写。
