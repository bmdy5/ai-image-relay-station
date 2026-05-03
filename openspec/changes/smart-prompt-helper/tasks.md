## 1. 后端核心逻辑

- [ ] 1.1 创建 `backend/core/prompt_enhance.py`：
  - [ ] 1.1.1 编写“助手模式”System Prompt。
  - [ ] 1.1.2 实现语种自适应逻辑（不强制中文）。
  - [ ] 1.1.3 实现模型 Fallback 机制（Qwen -> GPT）。
- [ ] 1.2 升级 `backend/api/image.py`：
  - [ ] 1.2.1 实现内存级 `RateLimiter`（5次/分钟）。
  - [ ] 1.2.2 新增 `POST /enhance-prompt` 路由。

## 2. 前端视觉与交互实现

- [ ] 2.1 编写 CSS 呼吸灯特效：
  - [ ] 2.1.1 定义 `@keyframes ai-shimmer` 渐变边框动画。
  - [ ] 2.1.2 在 `index.css` 或组件样式中增加对应类名。
- [ ] 2.2 升级 `HomePage.jsx` (PC)：
  - [ ] 2.2.1 增加 `historyPrompt` 状态管理。
  - [ ] 2.2.2 绑定优化按钮、呼吸灯类名及“撤销”链接。
  - [ ] 2.2.3 增加风格切换的覆盖确认逻辑。
- [ ] 2.3 升级 `MobileHomePage.jsx` (Mobile)：
  - [ ] 2.3.1 同步状态逻辑，美化 `Sparkles` 按钮交互。
  - [ ] 2.3.2 适配移动端的覆盖确认对话框。

## 3. 测试与精修

- [ ] 3.1 验证动画流畅度。
- [ ] 3.2 验证不同语种、不同风格下的润色质量。
- [ ] 3.3 压力测试限流逻辑。
