# AI 驱动开发与功能实现规范 (V1.0)

为了保持 GPT-Image2 中转站项目的稳定性与一致性，后续所有 AI 助手在开发新功能时必须严格遵守以下规范。

## 1. 全链路参数闭环 (Full-Stack Data Integrity)
禁止在前端或后端进行任何 UI 表现层上的“硬编码”或“默认值假设”。
- **前端请求**：必须将用户选择的所有参数（如 `quality`, `style`, `model_type` 等）封装在 POST 请求中。
- **后端模型**：`backend/models/models.py` 中的 `ImageLog` 必须有对应的持久化字段。
- **数据库存储**：新增字段必须执行 `ALTER TABLE` 确保旧数据兼容。
- **接口返回**：`/history` 和 `/status` 接口必须显式返回这些字段，不得漏传。

## 2. 显式标注原则 (Explicit Labeling)
用户在 UI 上看到的任何状态标签（Badge）必须是真实数据的组合反映。
- **格式规范**：采用 `[版本] - [模式/风格]` 格式（如：`标准版 - 极致写实`）。
- **逻辑一致性**：标签内容必须直接调用后端返回的字段（如 `img.quality` 和 `img.style`），并通过统一的映射函数（如 `getFeatureLabel`）转换。

## 3. 系统自愈与基础设施 (Self-Healing Infrastructure)
项目依赖 SSH 隧道连接远程数据库，稳定性是第一优先级。
- **启动机制**：必须通过 `start.sh` 启动。该脚本内置了隧道守护进程（Tunnel Guard），每 5 秒自动检测并重连断开的 3307 端口。
- **免密依赖**：隧道依赖 SSH Key 免密登录。若隧道失效，请首先检查 `ssh-copy-id` 是否配置。
- **日志审计**：隧道异常查看 `tunnel.log`，后端异常查看 `backend.log`。

## 4. 并行任务与配额管理
- **三路并行**：当前系统支持每个用户同时进行 3 个生图任务。修改此限制需同步更新后端 `generate_image` 逻辑及前端 Toast 提示。
- **安全重试**：生图任务仅在“非扣费性质”的网络超时下重试，API 返回错误时严禁自动重试以保护用户积分安全。

## 5. 开发建议
- **先测后改**：修改后端逻辑后，必须通过 `curl` 或 Python 脚本验证接口返回的 JSON 结构是否符合预期。
- **MVC 守则**：严格区分 Model (数据库), Controller (API 逻辑), View (React 前端)。

## 6. 多协议探测与 Vision-JSON 对齐 (Multi-Protocol Probing)
对于 GPT-Image-2 等 2026 年新款模型，严禁盲目依赖旧版 DALL·E 2 的 Multipart/Binary 协议。
- **探测先行**：在遇到图生图失效（AI 忽略参考图）时，必须编写专门的 `probe` 脚本进行协议变体测试（JSON vs Multipart, image vs images），直到实锤 `image_tokens` 消耗或 API 接受参数。
- **Vision 协议规范**：
    - **端点路由**：图生图任务必须路由至 `/v1/images/edits`；纯文生图保留在 `/v1/images/generations`。
    - **数据格式**：强制采用 **纯 JSON**。参考图通过 `images: [{"image_url": "URL"}]` 数组传递（注意字段名为复数 `images`）。
    - **指令纯净化**：禁止在文本 Prompt 中混合图片 URL。图片必须作为独立的数据对象（Data Object）存在，以防 AI 语义混淆。
- **极致交互 (Interaction UX)**：
    - **剪贴板赋能**：前端输入框必须实现 `onPaste` 监听，支持直接粘贴图片并自动转换为参考图，缩短创作链路。

---
*最后更新：2026-05-01 by Antigravity (Protocol Refactor Complete)*
