## Why

当前系统虽然已实现登录注册，但缺乏基本的退出逻辑和个人中心页面，导致用户无法管理自己的账户（如修改密码）或查看积分消耗情况，应用完整度较低。实现这一套基础功能是将其从“演示版”转变为“正式版”的关键步骤。

## What Changes

1.  **退出登录**：前端增加登出操作，清除本地存储的 JWT Token 并重定向至登录页。
2.  **个人中心**：新增 `ProfilePage` 页面，展示用户信息（用户名、余额、注册时间）。
3.  **修改密码**：在个人中心提供修改密码功能，需验证旧密码。
4.  **积分明细**：在个人中心集成简单的消费历史列表，让用户清楚积分去向。

## Capabilities

### New Capabilities
- `account-management`: 用户个人中心、密码修改及账户信息展示。
- `session-termination`: 安全退出登录逻辑。
- `consumption-tracking`: 积分消耗记录的查询与展示。

### Modified Capabilities
- 无

## Impact

- **Frontend**: 新增 `ProfilePage.jsx`，修改 `HomePage.jsx` 导航栏，完善 `request.js` 的登出逻辑。
- **Backend**: 新增 `/api/auth/logout` (可选)、`/api/auth/change-password`、`/api/user/consumption` 接口。
- **Database**: 现有 `users` 和 `image_logs` 表已足够支持，无需结构变更。
