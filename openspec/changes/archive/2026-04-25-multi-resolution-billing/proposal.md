## Why

系统目前的计费与规格逻辑过于单一，无法体现 DALL-E 3 不同质量档位的商业价值。本项目旨在落实 V1.3 极简规范，提供高性价比的阶梯计费，并解决任务“假死”锁定的工程痛点。

## What Changes

- **极简画质选择**: 在 `HomePage.jsx` 侧边栏提供“标准/高清/大师”三个档位，取消分辨率选择以降低用户认知负荷。
- **默认规格固定**: 统一锁定为 1024x1024 像素输出。
- **后端计费引擎 (V1.3)**: 实施 5/15/30 积分矩阵，实现预扣费与失败秒退。
- **Anti-Stuck 机制**: 
    - 引入 60s 后端硬超时，超时自动解锁并退费。
    - 个人中心增加“重置活动任务”一键清理功能。
- **价格页同步**: 更新 `/pricing` 页面，展示最新的 3 档位计费规则。

## Capabilities

### New Capabilities
- `billing-task-guard`: 负责并发锁、硬超时及手动重置的逻辑守护。

### Modified Capabilities
- `credits-system`: 接入 V1.3 极简 3 档位计费。
- `image-generation`: 支持画质档位参数下发。

## Impact

- `frontend/src/pages/HomePage.jsx`: 简化参数选择区。
- `frontend/src/pages/PricingPage.jsx`: 更新计费卡片信息。
- `frontend/src/pages/ProfilePage.jsx`: 增加任务重置功能。
- `backend/api/image.py`: 核心计费与超时逻辑。
