# Visionary AI 协同开发规范 (V1.0)

为了保持代码的高可维护性，所有 AI 助手在修改本项目时必须遵守以下守则：

## 1. 数据库优先
*   禁止硬编码配置项。所有新功能参数必须考虑是否存入 `system_configs`。
*   修改 Schema 时，必须在 `backend/models/models.py` 中更新 SQLAlchemy 模型，并提供对应的 SQL 补丁。

## 2. 异步处理
*   生图任务严禁同步等待。必须使用后台任务 (BackgroundTasks) 或队列处理。
*   所有 API 响应时间必须通过 `api_duration` 等字段在 `image_logs` 中记录。

## 3. 前端交互
*   坚持使用 Vanilla CSS。除非用户明确要求，否则禁止引入重量级组件库。
*   必须包含 `loading` 状态和具体的进度反馈提示。

---
*最后更新: 2026-05-06*
