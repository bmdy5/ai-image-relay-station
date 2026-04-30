## ADDED Requirements

### Requirement: PC 端多栏布局架构
系统 SHALL 在 PC 端（宽度 > 1024px）为个人中心和价格页提供多栏布局，确保在大屏上视觉平衡。

#### Scenario: 访问 PC 版个人中心
- **WHEN** 用户使用宽度大于 1024px 的浏览器访问 `/profile`
- **THEN** 系统展示带有 280px 侧边栏和右侧内容区的布局，且用户名字正确显示在显著位置。

#### Scenario: 访问 PC 版价格页
- **WHEN** 用户使用宽度大于 1024px 的浏览器访问 `/pricing`
- **THEN** 系统展示三栏栅格排列的价格套餐卡片，无需横向滚动即可查看全部。

### Requirement: 设备感知分发
系统 SHALL 通过 `ProfilePage.jsx` 和 `PricingPage.jsx` 作为入口，根据 `isMobile` 状态物理分发渲染逻辑。

#### Scenario: 移动端保持原样
- **WHEN** 用户使用移动设备（宽度 <= 1024px）访问
- **THEN** 系统加载 `MobileProfilePage` 或 `MobilePricingPage`，界面与当前线上版本一致。
