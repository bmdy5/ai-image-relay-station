# 知识快照 (Context Snapshot) - 2026-04-27 11:48

**目标:** 
修复生图失败问题，实现毫秒级性能监控（三段式耗时），彻底关闭重试以保护中转站余额。

**已变更的代码/配置:**
1. **`backend/api/image.py`**: 
   - **重构逻辑**：移除 `while` 循环，设置 `max_retries = 0`，确保单次请求。
   - **性能统计**：在 `process_image_task` 中精准捕捉 `queue`, `api`, `storage` 耗时。
   - **修复导入**：修正了 `backend.models.database` 和 `get_current_user` 的导入路径。
   - **路由修正**：添加了 `prefix="/image"`，匹配前端请求。
2. **`api/index.py`**: 已恢复，作为后端 Uvicorn 启动的主入口。
3. **`frontend/src/api/request.js`**: 设置了 `baseURL`（开发环境 localhost:8000），并将超时延长至 5 分钟。
4. **`frontend/src/pages/HomePage.jsx`**: 增加了 `lastStatus` 追踪，实现 Console 实时状态切换日志及生图成功后的“价格+耗时”报告。
5. **清理工作**: 已删除 `vercel.json` 和 `Vercel-Readme.md`，移除了所有 Vercel 冗余配置。

**未完待续的断点:** 
1. **一键启动测试**：运行 `sh start.sh` 启动后端与前端。
2. **生图验证**：在页面点击生图，观察 F12 Console 的实时状态日志（pending -> generating -> success）。
3. **审计核实**：运行 `tail -f backend.log` 查看后端的 `[Task Audit]` 报告，确认耗时拆解和积分退还逻辑是否正确。

请等待 User 确认“开始”后方可编写代码！
