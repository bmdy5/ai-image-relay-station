## 1. 物理隔离与代码准备

- [x] 1.1 将 `frontend/src/pages/ProfilePage.jsx` 的现有内容完整迁移至新文件 `frontend/src/pages/MobileProfilePage.jsx`
- [x] 1.2 将 `frontend/src/pages/PricingPage.jsx` 的现有内容完整迁移至新文件 `frontend/src/pages/MobilePricingPage.jsx`
- [x] 1.3 在 `ProfilePage.jsx` 和 `PricingPage.jsx` 中仅保留基础的 Dispatcher 逻辑（根据 `isMobile` 返回 PC 或 Mobile 版本）

## 2. 重构 PC 版个人中心 (PCProfilePage)

- [x] 2.1 创建 `frontend/src/pages/PCProfilePage.jsx`，实现“侧边栏 + 主内容区”的桌面端布局
- [x] 2.2 修复名字显示 Bug：确保 `userInfo.username` 在 PC 布局中显著显示，并检查 `isMobile` 渲染冲突是否影响了状态获取
- [x] 2.3 将移动端的抽屉交互改为 PC 端的 Modal 或内联表单（针对修改密码和意见反馈）

## 3. 重构 PC 版价格页 (PCPricingPage)

- [x] 3.1 创建 `frontend/src/pages/PCPricingPage.jsx`，实现三栏平铺的响应式价格卡片布局
- [x] 3.2 优化 PC 端的“权益对比”表格，使其全宽显示且对齐更工整
- [x] 3.3 移除 PC 端不必要的 `overflow-x: auto` 滚动逻辑

## 4. 验证与润色

- [x] 4.1 检查 `App.jsx` 中的路由分发，确保所有页面都能正确感知设备变化
- [ ] 4.2 进行浏览器测试：确认 PC 端 UI 比例正常，背景动效无遮挡，交互流畅
- [ ] 4.3 进行移动端回归测试：确认 `MobileProfilePage` 和 `MobilePricingPage` 依然完美运行
