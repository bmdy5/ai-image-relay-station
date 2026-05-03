# AI 提示词助手集成技术指南 (AI Prompt Helper Technical Guide)

## 1. 系统概述 (Overview)
本项目集成了一个基于 LLM（优先 Qwen-Plus）的提示词智能润色系统。该系统旨在帮助用户将简单的描述扩充为高质量、具象化的 AI 绘画提示词，同时保持与选定艺术风格的审美一致性。

## 2. 核心架构 (Architecture)
- **后端引擎**：`backend/core/prompt_enhance.py`
  - 采用“助手模式”System Prompt。
  - 具备语种自适应（中文进中文出，英文进英文出）。
  - **风格感知**：通过 `STYLE_CONTEXT` 字典为不同风格提供特定的物理媒介描述（如手绘线条、写实肌理）。
- **API 接口**：`POST /image/enhance-prompt`
  - **限流策略**：内存级 `SimpleRateLimiter`，限制单用户 5 次/分钟。
  - **准入校验**：具备黑名单机制，拦截结构化风格的润色请求。

## 3. 审美冲突防御机制 (Style Conflict Defense)
为了防止 AI 的“发散性创作”破坏高度结构化的模版逻辑，系统采用了 **“方案 B：有条件开放”** 策略。

### ✅ 允许润色白名单 (Whitelist)
为了极致的生图准确度，系统仅允许以下 4 种基础风格使用智能润色：
- `default` (默认风格)
- `real` (极致写实)
- `product` (电商白底)
- `tech_poster` (科技海报)

### 🚫 禁用范围
除上述 4 种风格外，所有专业/旗舰风格（如旅游攻略、UI 进化等）均已强制禁用润色功能，以保护模版正则匹配的完整性。

## 4. 维护与扩展建议 (Maintenance)
- **新增风格时**：请在 `HomePage.jsx` 的 styles 数组中评估是否需要设置 `disableEnhance: true`。
- **提示词质量下降时**：优先检查 `backend/core/prompt_enhance.py` 中的 `STYLE_CONTEXT` 描述是否准确，或升级 `SYSTEM_PROMPT` 的媒介约束。

---
*Created by Antigravity (Advanced Agentic Coding Agent) on 2026-05-03*
