## Why

当前画图流程存在显著的性能瓶颈（生图耗时约 2 分钟、后端同步阻塞 IO）和体验问题（进度条模拟、画廊加载缓慢、缺乏生图后台任务引导）。此外，图片存储在公有桶中存在隐私风险，且后端数据库连接在长时 AI 调用期间被无效占用。

## What Changes

- **后端优化**:
    - **非阻塞 IO**: 将 COS 上传改为异步操作或使用线程池包装，避免阻塞 FastAPI 事件循环。
    - **连接管理**: 在调用长时 AI 接口期间释放数据库连接，完成后重新获取。
    - **计费重构**: 采用“积分冻结”模式（方案 B），提交任务时锁定积分，AI 成功后才正式扣除，失败则释放。
    - **重试机制**: 增加 AI 接口调用与图片转存的重试逻辑。
- **安全增强**:
    - **混淆存储**: 采用超长不可猜测的 UUID 作为文件名，COS 桶保持“公有读”以支持社交分享，兼顾隐私与易用性。
- **前端优化**:
    - **秒开加载**: 画廊直接加载 COS 链接，跳过后端路由重定向。
    - **占位卡片**: 在“我的创作”中实时显示 `pending` 状态的任务，采用毛玻璃动画占位，解决异步等待焦虑。
    - **缩略图加速**: 利用 COS 数据万象（CI）在画廊显示 WebP 缩略图，并实现“先模糊再清晰”的加载效果。
- **交互升级**:
    - **真实进度**: 将 95% 假进度条改为基于后端状态（提交、生成中、转存中、完成）的分段映射。
    - **异步引导**: 点击生成后立即提示用户任务已进入后台，可前往“我的创作”查看。

## Capabilities

### New Capabilities
- `cos-thumbnail-processing`: 利用 COS 数据万象动态生成缩略图，优化画廊加载速度。
- `asynchronous-task-feedback`: 提供明确的异步任务提交反馈，引导用户在后台处理期间的操作。
- `frozen-credits-billing`: 实现积分两阶段冻结模式，提升扣费逻辑的友好性与安全性。

### Modified Capabilities
- `image-generation`: 优化生图链路的 IO 性能与数据库连接利用率。
- `image-history-gallery`: 支持实时占位卡片与缩略图分段加载逻辑。
- `image-generation-feedback`: 将模拟进度逻辑改为基于后端阶段的状态反馈。
- `security`: 采用 UUID 混淆与公有读策略。

## Impact

- **API**: `POST /image/generate`, `GET /image/status/{id}`, `GET /image/history`
- **Backend Core**: `backend/core/cos.py`, `backend/api/image.py`
- **Frontend Pages**: `HomePage.jsx`, `HistoryPage.jsx`
- **Infrastructure**: 腾讯云 COS 权限配置与数据万象开启，数据库 User 表结构变更。
