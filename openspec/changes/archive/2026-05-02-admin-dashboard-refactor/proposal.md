## Why

目前管理员页面功能单一，缺乏直观的运营数据展示（如注册趋势、付费转化、利润分析等）。同时，现有的积分扣费逻辑采用“先扣除后退款”模式，在极端故障情况下可能导致用户积分丢失或显示异常，影响用户信任。为了提升管理效率并优化交易安全性，需要重构管理员控制台及底层支付逻辑。

## What Changes

- **管理员仪表盘 (Admin Dashboard)**：新增可视化看板，展示关键指标（KPI）、风格排行及全站实时生图流。
- **“静默冻结”扣费逻辑**：重构积分扣除流程，改为“启动预占 -> 成功实扣 -> 失败解冻”模式，且前端余额在成功前保持不变。
- **财务利润对账**：支持管理员手动输入 API 账单成本，结合用户充值数据自动生成利润报表。
- **全息监控流**：提供上帝视角监控全站 Prompt 与生图结果，支持一键抹除违规内容。

## Capabilities

### New Capabilities
- `financial-reporting`: 支持手动输入成本并自动计算净利润的财务对账能力。
- `live-activity-monitor`: 监控全站实时生图动态及内容审计的能力。

### Modified Capabilities
- `frozen-credits-billing`: 将“预扣费”逻辑修改为“静默冻结+成功后实扣”的事务模式。
- `admin-tools`: 扩展管理员工具集，支持可视化图表数据接口。

## Impact

- **Backend**: `backend/api/image.py` (扣费逻辑), `backend/api/admin.py` (统计接口), `backend/models/models.py` (字段补充)。
- **Frontend**: `frontend/src/pages/AdminPage.jsx` (UI 重构), 引入轻量级统计图表展示。
- **Data**: `ImageLog` 表新增计费快照字段。
