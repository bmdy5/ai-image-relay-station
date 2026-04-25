## 1. 历史画廊交互开发

- [x] 1.1 在 `HistoryPage.jsx` 的预览模态框中添加“复用此 Prompt”按钮。
- [x] 1.2 实现 `handleReuse` 函数：将选中 Prompt 写入 `sessionStorage` 并跳转至首页。
- [x] 1.3 为画廊卡片添加悬浮“复用”图标，提升快捷操作体验。

## 2. 首页自动填充逻辑

- [x] 2.1 在 `HomePage.jsx` 中新增 `useEffect` 逻辑，在组件挂载时检测 `sessionStorage`。
- [x] 2.2 实现 Prompt 自动填入 `prompt` state 的逻辑，并确保填入后立即执行 `sessionStorage.removeItem`。
- [x] 2.3 体验优化：自动填入后使输入框自动获得焦点。

## 3. 自检与测试

- [x] 3.1 整体链路测试：画廊复用 -> 首页填充 -> 立即生图。
- [x] 3.2 边界测试：手动刷新首页确保不会出现重复填充。
- [x] 3.3 主动复查：检查代码是否符合 MVC 极简原则及项目规范。
