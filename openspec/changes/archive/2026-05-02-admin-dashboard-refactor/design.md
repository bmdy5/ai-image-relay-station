## Context

当前管理员页面仅支持基础的充值审核和反馈处理。生图逻辑采用先扣除积分再根据结果退还的模式，导致用户在生成期间余额显示不稳定。运营侧缺乏对成本和利润的直观掌握。

## Goals / Non-Goals

**Goals:**
- 实现“静默扣费”事务，确保只有生成成功才扣除余额。
- 提供可视化的管理员仪表盘，集成实时监控和财务分析。
- 支持动态风格统计，无需前端硬编码。

**Non-Goals:**
- 不重写支付系统的底层网关（如支付逻辑保持不变，仅改积分结算）。
- 不对存量数据进行大规模强制迁移。

## Decisions

### 1. 交易模式切换：从“扣除/退还”到“冻结/确认”
- **决策**：使用 `frozen_points` 作为中间状态。
- **理由**：
    - 解决用户余额在生成期间“跳变”的问题。
    - 在极端崩溃情况下，管理员可以通过清除 `frozen_points` 轻松修复用户余额。
- **流程**：
    - `Task Start`: `points` 不动，`frozen_points += cost`。
    - `Task Success`: `points -= cost`, `frozen_points -= cost`。
    - `Task Fail`: `frozen_points -= cost`。

### 2. 财务对账：离线与实时结合
- **决策**：在 `ImageLog` 中记录 `cost_points` 和 `status`，管理员手动输入外部账单。
- **理由**：由于外部 API 厂商（中转站）不返回单次实时成本，全自动核算不现实。手动输入本月总账单是最精准的利润计算方式。

### 3. UI 架构：模块化仪表盘
- **决策**：将 `AdminPage` 改造为标签页结构，首页为 `Dashboard`。
- **技术栈**：继续使用 `lucide-react` 图标和原生 CSS 渐变/毛玻璃效果，保持与安全中心风格统一。

## Risks / Trade-offs

- **[Risk] 并发过冲** → **Mitigation**: 在预占积分前进行数据库行级锁定或严格的余额校验（`points - frozen_points >= cost`）。
- **[Risk] 数据统计缓慢** → **Mitigation**: 对 `ImageLog` 的 `created_at` 字段建立索引，确保大规模数据下的统计速度。
