# 友好的后台任务异常翻译器设计 (Friendly Error Handling)

## 背景 (Context)
当前生图系统在遇到上游 API 报错时（例如 DALL-E 3 的版权风控 `moderation_blocked`），会直接将原始报错 JSON 和状态码通过 `repr(e)` 抛出并记录到数据库 `ImageLog.error_msg` 中。这导致前端页面直接将开发者视角的报错（如 `API Error (400): {"error":...}`）展示给终端用户，体验极差且无法指导用户如何解决问题。

## 目标 (Goals)
- 拦截所有生图异常，将其转换为通俗易懂的中文提示。
- 对于 `400 moderation_blocked`（版权拦截），需明确提示用户“删减敏感词或使用参考图替代”。
- 前端逻辑零侵入（遵守 MVC），翻译统一在后端的异常处理口径进行。

## 架构与数据流 (Architecture & Data Flow)
1. **统一异常转译器**：新增 `backend/core/errors.py` 并包含 `parse_friendly_error(error_msg: str) -> str` 方法。
2. **异常捕获点注入**：在 `backend/services/image_service.py` 的核心生图逻辑 `process_image_task` 中，捕获异常后调用该翻译器。
3. **数据库存储**：数据库 `ImageLog.error_msg` 将直接保存转译后的中文提示。
4. **前端展示**：前端 `HomePage.jsx` 维持现状，直接将接口下发的 `error_msg` 渲染在屏幕上，完美适配汉化后的文本。

## 错误字典与翻译策略 (Error Mapping Strategy)
- **风控/拦截 (`moderation_blocked`)** ➡️ "生成失败：提示词可能包含敏感词或知名版权角色（已被安全系统拦截）。建议删掉影视/动漫等版权名称，或直接上传相关图片作为【参考图】来替代文字名词生成。"
- **额度耗尽 (`insufficient_quota`)** ➡️ "生成失败：接口生图额度已耗尽，请联系管理员充值或更换渠道。"
- **鉴权失败 (`invalid_api_key` / `401`)** ➡️ "生成失败：接口鉴权配置无效，请联系管理员检查配置。"
- **频率限制 (`rate_limit_exceeded` / `429`)** ➡️ "生成失败：上游接口调用过于频繁，请稍等片刻后再试。"
- **上游服务异常 (`502/503/504/500`)** ➡️ "生成失败：上游生图服务器暂时繁忙或异常，请稍后再试。"
- **网络超时 (`timeout` / `ConnectError`)** ➡️ "生成失败：网络连接超时，上游服务器未及时响应，请稍后重试。"
- **非合规参考图 (`valid png` / `alpha channel`)** ➡️ "生成失败：上游接口要求上传的参考图必须是带透明背景（Alpha通道）的正方形 PNG 格式图片。"
- **通用 JSON 回退** ➡️ 尝试提取原始报错 JSON 中的 `message` 字段，以 `生成失败：{message}` 的格式返回。
- **兜底** ➡️ "生成失败：系统遇到未知错误，请重试或联系管理员。"

## 测试与验证 (Testing)
- 生图抛出 `Exception('API Error (400): {"error":{"code":"moderation_blocked"}}')` 能够正确提取并在数据库生成预期中文。
- JSON 解析回退机制应能够处理截断的文本而不抛出二次崩溃。
