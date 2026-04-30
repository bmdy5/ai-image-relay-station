## Context

目前项目已有 `HomePage.jsx` (PC) 和 `MobileHomePage.jsx` (Mobile) 的拆分先例。然而，个人中心 (`ProfilePage`) 和价格页 (`PricingPage`) 仍混在一个文件中，且主要采用移动端布局。在 PC 端展示时，元素横向拉伸极其严重，且由于 PC 端存在一些背景动效 (Canvas) 的渲染层级问题，导致交互体验不佳。

## Goals / Non-Goals

**Goals:**
- 实现 `ProfilePage` 和 `PricingPage` 的 PC/Mobile 代码隔离。
- 解决 PC 端个人中心名字不显示的问题。
- 为 PC 端设计更具商务感的多栏布局。
- 确保移动端 UI 的零改动和稳定性。

**Non-Goals:**
- 不涉及后端 API 的逻辑修改（仅 UI 适配）。
- 不对 `LoginPage` 或 `RegisterPage` 进行拆分（目前它们已稳定）。

## Decisions

### 1. 采用 Dispatcher 分发模式
- **方案**：在主入口文件（如 `ProfilePage.jsx`）中，不编写具体 UI 逻辑，仅通过 `isMobile` 钩子返回对应的组件。
- **理由**：与 `HomePage` 的拆分逻辑保持一致，符合项目既有模式，易于后续维护。

### 2. PC 端布局设计：侧边栏 + 内容区 (Profile)
- **方案**：`PCProfilePage` 采用经典的 280px 侧边栏（导航项）+ 右侧宽屏卡片内容区。
- **理由**：比移动端的垂直列表更适合 PC 屏幕，且能容纳更多设置项，避免视觉空旷。

### 3. PC 端布局设计：栅格化排列 (Pricing)
- **方案**：`PCPricingPage` 将价格卡片从“横向滚动”改为“三栏式响应式栅格”。
- **理由**：PC 用户期望一目了然看到所有价格选项，而不是去滑动。

## Risks / Trade-offs

- **[Risk] 代码重复度增加** → **Mitigation**: 提取通用的 API 请求逻辑（如 `fetchData`, `handleRecharge`）到自定义 Hook 或工具函数中，两个版本的 JSX 仅处理表现层。
- **[Risk] 组件状态同步** → **Mitigation**: 由于两个版本不会同时显示，状态同步主要通过重新挂载时的 `useEffect` 初始化解决。
