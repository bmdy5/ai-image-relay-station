## 1. 后端搜索功能增强

- [x] 1.1 修改 `backend/crud/image.py`：扩展 `get_user_image_logs` 以支持 `keyword` 参数和模糊查询。
- [x] 1.2 修改 `backend/api/image.py`：在 `/history` 路由中接收并传递 `keyword` 参数。

## 2. 首页 Loading 体验增强

- [x] 2.1 修改 `HomePage.jsx`：在生图期间禁用所有输入控件及提交按钮。
- [x] 2.2 在 `HomePage.jsx` 结果区实现 `CreationLoader` 组件，展示带有品牌色渐变的动画 Loading 效果。

## 3. 历史页搜索交互实现

- [x] 3.1 在 `HistoryPage.jsx` 顶部添加带有搜索图标的输入框。
- [x] 3.2 实现搜索防抖逻辑（Debounce），触发搜索时清除现有列表并从第一页重新加载。
- [x] 3.3 调整 `HistoryPage` 的布局，确保搜索框与瀑布流画廊和谐共存。

## 4. 自检与测试

- [x] 4.1 整体链路测试：执行搜索、验证 Loading 动画及防止重复点击。
- [x] 4.2 性能确认：确保搜索操作不会导致页面卡顿。
- [x] 4.3 主动复查：检查代码逻辑是否符合项目 MVC 及 SQL 归集规范。
