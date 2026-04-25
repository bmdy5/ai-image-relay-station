## 1. 后端 API 开发

- [x] 1.1 在 `backend/crud/user.py` 中添加 `update_password` 函数。
- [x] 1.2 在 `backend/api/auth.py` 中添加 `POST /change-password` 路由，验证旧密码并更新。
- [x] 1.3 创建 `backend/api/user.py` 并添加 `GET /consumption` 路由，按时间倒序返回当前用户的 `ImageLog`。
- [x] 1.4 在 `api/index.py` 中注册新的 `user` 路由。

## 2. 前端页面与逻辑

- [x] 2.1 修改 `frontend/src/api/request.js`，增加登出清理逻辑。
- [x] 2.2 修改 `frontend/src/pages/HomePage.jsx`，在顶部导航栏增加“个人中心”链接和“退出登录”按钮。
- [x] 2.3 新建 `frontend/src/pages/ProfilePage.jsx`，实现基础布局和个人信息展示。
- [x] 2.4 在 `ProfilePage.jsx` 中实现“修改密码”表单及提交逻辑。
- [x] 2.5 在 `ProfilePage.jsx` 中实现“消费记录”列表展示。
- [x] 2.6 在 `frontend/src/App.jsx` 中配置 `/profile` 路由并应用 `PrivateRoute`。

## 3. 自检与验证

- [x] 3.1 验证退出功能：点击退出后 localStorage 清理且页面重定向。
- [x] 3.2 验证修改密码：测试旧密码错误、新密码成功修改的情形。
- [x] 3.3 验证积分明细：新生成的图片能实时出现在明细列表中。
- [x] 3.4 **自检**：对比 `pending-features.md` 确认功能点无遗漏，且代码风格与项目一致。
