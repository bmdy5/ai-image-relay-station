## Context

本项目是一个基于 GPT-Image 2 的 AI 绘图中转站。当前状态为从零构建，核心约束是使用 Vercel (Serverless) 部署，并采用 SQLite 作为初期开发数据库。项目需要满足极简付费闭环（手动充值）和高安全性（API Key 隔离）。

## Goals / Non-Goals

**Goals:**
- 实现暗黑简约的高级感前端界面。
- 建立稳定的“账号+密码”鉴权体系，并硬性限制前 100 名用户注册。
- 实现积分计费逻辑（1积分=0.1元），支持低/中/高三档规格生图。
- 搭建安全的隐藏管理员后台，支持手动充值积分。
- 确保 API Key 仅在后端可见，并设置消费熔断。

**Non-Goals:**
- **自动支付**: 第一版不支持在线支付，需人工核对后手动加分。
- **Thinking 流式输出**: 第一版 Thinking 模式仅做接口预留或置灰，暂不支持异步轮询展示。
- **第三方登录**: 暂不支持微信/GitHub 等第三方登录，以简化开发。

## Decisions

- **鉴权方案**: 采用 `JWT (JSON Web Token)` + `Bcrypt` 密码哈希。
  - *Rationale*: 无需 Session 存储，完美适配 Vercel 的 Serverless 架构，且安全性高。
- **后端架构**: 使用 `FastAPI` (Python)。
  - *Rationale*: 异步处理性能好，与 Vercel Serverless 函数配合成熟，类型检查完善。
- **数据库**: 初期使用 `SQLite`。
  - *Rationale*: 用户指定本地先行，部署时建议对接 `TiDB Cloud` 或 `PlanetScale` 等免费云数据库以解决 Vercel 的 Stateless（无状态）限制。
- **管理员安全**: 前端路由守卫 + 后端权限校验 + 独立管理码。
  - *Rationale*: 确保 `/admin` 页面在物理和逻辑上均无法被普通用户访问。

## Risks / Trade-offs

- **[数据持久化]** -> Vercel 磁盘是只读/临时的。
  - *Mitigation*: 强烈建议在部署阶段使用云数据库（如 TiDB Cloud 免费版），本设计在代码层级将保持数据库连接的可配置性。
- **[高并发生图]** -> 10-20 秒的生成时间可能导致 Serverless 函数超时。
  - *Mitigation*: 调整 Vercel 函数超时配置至最高限制，或引导用户在生成时不要刷新页面。
- **[成本超支]** -> 如果有人恶意调用 API。
  - *Mitigation*: 后端强制校验用户积分余额，且在 OpenAI 调用层增加单日总额统计，达到阈值自动熔断。
