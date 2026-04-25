## Context

目前用户在历史画廊中只能查看图片，无法将灵感直接导回生产环境。

## Goals / Non-Goals

**Goals:**
- 实现跨页面 Prompt 无缝传递。
- 在首页自动聚焦并填入 Prompt。
- 保持 UI 交互的简洁性。

**Non-Goals:**
- 复用图片的参数（如长宽比、质量等）暂不在本阶段实现，仅复用 Prompt 文本。
- 不涉及多选复用。

## Decisions

- **数据传递机制**：采用 `sessionStorage`。
    - **理由**：相较于 URL Query String，`sessionStorage` 能处理更长的文本且无需处理 URL 编码；相较于 `localStorage`，它在会话结束后自动清理，更符合“临时携带”的语义。
- **首页逻辑控制**：在 `HomePage.jsx` 的生命周期钩子（`useEffect`）中增加检测逻辑。
    - **执行顺序**：检测 -> 填入 -> **立即清理 Storage**。清理是为了防止用户刷新页面后再次被自动填入。
- **交互位置**：在 `HistoryPage` 的缩略图悬浮状态增加小图标按钮，以及在详情模态框中增加显眼的“复用此 Prompt”按钮。

## Risks / Trade-offs

- **[Risk] 覆盖用户现有输入** → **Mitigation**: 如果用户在首页已经有输入内容，复用操作将覆盖它。由于用户是主动从画廊触发“复用”并跳转的，这种覆盖符合预期。
