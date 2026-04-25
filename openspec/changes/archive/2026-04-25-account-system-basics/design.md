## Context

当前用户登录后留在 `HomePage`，无法退出或管理账户。后端已有 `User` 和 `ImageLog` 模型，但缺少针对普通用户查询明细和修改密码的控制器逻辑。

## Goals / Non-Goals

**Goals:**
- 提供完整的登出链路。
- 提供展示个人资产（积分）和消费记录的界面。
- 提供安全的密码修改功能。

**Non-Goals:**
- 不涉及邮箱/手机号找回密码（无短信/邮件网关）。
- 不涉及头像上传。

## Decisions

1.  **登出实现**：纯客户端行为，通过 `localStorage.removeItem('token')` 实现。在 `HomePage` 导航栏增加退出按钮。
2.  **API 扩展**：
    *   `POST /api/auth/change-password`：接收新旧密码，由 `crud/user.py` 校验哈希并更新。
    *   `GET /api/user/consumption`：复用 `models.ImageLog` 表，按 `created_at` 倒序返回当前用户记录。
3.  **前端路由**：新增 `/profile` 路径，使用 `PrivateRoute` 保护。
4.  **UI 风格**：复用现有的 `Inter` 字体和 `Orange` 主色调。个人中心采用左侧菜单或垂直卡片布局。

## Risks / Trade-offs

- **风险**：无退出接口可能导致 JWT 无法在服务端立即失效（无黑名单机制）。
- **权衡**：考虑到当前是 MVP，不引入 Redis 维护黑名单，仅做客户端退出。
