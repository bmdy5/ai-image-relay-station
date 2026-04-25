## Context

原有的分辨率阶梯方案因成本倒挂及技术复杂性被弃用，现转向 V1.3 极简方案。

## Goals / Non-Goals

**Goals:**
- 实现 5/15/30 的极简 3 档位计费。
- 解决并发槽位被“假死”任务占据的 UX 问题。

**Non-Goals:**
- 不再进行后端分辨率缩放或 AI 超分处理。

## Decisions

- **默认分辨率**: 全量锁定为 1024x1024。
- **并发处理**: 
    - 使用 Python `asyncio.wait_for` 或 `timeout` 装饰器实现 60s 硬超时。
    - 超时捕获后，立即执行 `db.rollback()` 或积分回滚，并清除 `pending` 计数。
- **UI 呈现**: 
    - `HomePage` 侧边栏使用 `Toggle Group` 或简洁的按钮组展示三个档位。
    - `ProfilePage` 增加一个红色警告样式的“重置任务锁”按钮。

## Risks / Trade-offs

- **[Risk] 任务重置滥用** → 用户可能在任务还在正常生成时点重置。**[Mitigation]** 在重置前提示“此操作仅在任务长时间卡死时使用，不会停止云端已发起的生成”。
- **[Risk] 利润率波动** → 5 积分档位利润较低。**[Mitigation]** 监控标准版使用比例，必要时通过 HD 版的高利润对冲。
