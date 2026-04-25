# 知识快照 (Context Snapshot) - 2026-04-25 13:48

**现状概览:**
我们正在从“单机/同步模式”向“生产级/异步模式（方案 B）”跨越。目前已完成腾讯云 COS 对接和异步任务重构，但后端因启动时反复出现的模块引用和命名冲突导致服务崩溃（502 Bad Gateway），导致无法登录测试。

**已攻克与变动点:**
- **环境变量**: `.env` 中已注入腾讯云 SecretId/Key/Bucket/Region。
- **COS 存储**: 新建 `backend/core/cos.py`，实现图片秒传云端。
- **异步重构**: `backend/api/image.py` 已改写为 `BackgroundTasks` 模式，秒回任务 ID。
- **计费逻辑**: 实现了“预扣费-后台生成-失败退费”的闭环，并在 `backend/core/utils.py` 定义了 `PRICING`。
- **前端升级**: `HomePage.jsx` 已改为轮询 `/api/image/status/{id}` 的异步模式。

**未完待续的断点:**
1. **解决服务崩溃**: 需排查 `backend/api/image.py` 中最新的启动报错（当前表现为 502，说明后端代码仍有导致 Uvicorn 无法加载的隐形语法或引用错误）。
2. **端到端跑通**: 服务恢复后，需要进行一次完整的生成测试，验证：点击生成 -> 扣费 -> 轮询 -> COS 链接展示。
