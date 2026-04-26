## Context

当前后端在处理生图任务时，对 `quality` 参数采取了忽略态度。所有的请求都统一发送 `gpt-image-2` 模型及 `1024x1024` 分辨率。为了配合前端的定价策略，我们需要在后端逻辑中注入参数分发器。

## Goals / Non-Goals

**Goals:**
- 实现三个档次的差异化参数：Standard (1024x1024), HD (1024x1536), Master (1024x1792 + quality: hd)。
- 优化前端生成过程中的 UI 表现（按钮可用性、提示文字）。
- 保持系统向后兼容，不影响现有数据库记录显示。

**Non-Goals:**
- 不涉及更换 API 供应商。
- 暂时不实现多轮对话的前端交互界面（仅预留后端接口能力）。

## Decisions

### 1. 参数映射表设计
在 `backend/api/image.py` 中定义一个静态或动态读取的参数映射配置。
- **Rationale**: 集中管理不同档次的参数，方便后续根据成本随时微调分辨率或质量因子。

### 2. 后端异步任务改造
修改 `process_image_task` 函数，将原来的固定 Payload 替换为根据 `quality` 参数生成的动态 Payload。
- **Rationale**: 确保异步执行时仍能正确引用用户在提交时选择的档次。

### 3. 前端 UI 状态回正
恢复 `HomePage.jsx` 中的三个生成档次，并增加 Tooltip 说明每个档次的具体优势。
- **Rationale**: 增强用户的“获得感”，证明积分花费的价值。

## Risks / Trade-offs

- **[Risk] 大尺寸图片导致超时** → **Mitigation**: 将 `httpx` 的超时时间从目前的 180s 维持不变，但在前端增加更友好的加载进度提示。
- **[Risk] 成本波动** → **Mitigation**: 建议在 `system_configs` 数据库表中增加 `IMAGE_HD_MULTIPLIER` 等系数，允许不改代码动态调价（本期先硬编码，后续考虑入库）。
