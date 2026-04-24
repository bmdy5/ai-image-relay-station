## Why

目前 OpenAI 官方 API 门槛极高（需海外 Visa 卡、复杂网络环境），且手机端订阅成本较高（$20/月）。本项目旨在搭建一个轻量化、国内直连的 AI 绘图中转站，通过“按需计费”和独家的“Thinking 模式”差异化服务，为国内用户提供高性价比、低门槛的商用级绘图能力。

## What Changes

- **用户系统**: 新增“账号+密码”注册登录功能，初期严格限制前 100 名用户内测。
- **绘图能力**: 对接 GPT-Image 2，支持极速（Instant）模式，预留思考（Thinking）模式接口。
- **计费系统**: 建立积分体系（1积分=0.1元），支持阶梯定价和消费日志记录。
- **管理员工具**: 新增隐藏的 `/admin` 管理后台，支持手动为用户充值积分及系统监控。
- **安全加固**: 实现 API Key 后端隔离、注册限额熔断、敏感词过滤及单日消费上限保护。

## Capabilities

### New Capabilities
- `user-auth`: 提供账号密码注册登录、JWT 鉴权及首批 100 人注册限额逻辑。
- `image-generation`: 实现前端生图界面、规格选择及后端 OpenAI API 转发逻辑。
- `credits-system`: 处理积分转换、扣费逻辑、生图日志记录及余额查询。
- `admin-tools`: 提供管理员充值接口、用户查询及带有路由守卫的隐藏后台页面。
- `security-risk`: 包含 API Key 后端保护、请求频率限制、关键词过滤及全站消费熔断。

### Modified Capabilities
- 无

## Impact

- **API 依赖**: 需配置 OpenAI 环境变量（API Key, Base URL）。
- **数据存储**: 使用本地 SQLite 存储用户信息、积分、日志及充值记录。
- **部署环境**: 适配 Vercel Serverless Functions (FastAPI) 架构。
