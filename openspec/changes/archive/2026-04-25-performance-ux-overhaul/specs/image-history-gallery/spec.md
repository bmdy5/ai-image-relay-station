## MODIFIED Requirements

### Requirement: 获取用户历史生图记录 (MUST)
系统 MUST 允许登录用户通过 API 获取其过往所有生图记录。API SHALL 直接返回图片的公网访问链接。

#### Scenario: 成功加载历史列表 (直连与占位模式)
- **WHEN** 用户进入“我的创作”页面
- **THEN** 系统发起 `GET /api/image/history` 请求。对于已成功的图片，返回 `image_url`；对于 `pending` 的任务，返回状态并由前端渲染占位卡片。

### Requirement: 图片预览详情 (MUST)
系统 MUST 支持点击画廊中的缩略图以弹出模态框（Modal）展示高清原图。

#### Scenario: 打开预览模态框 (原图加载)
- **WHEN** 用户点击画廊中的一张图片
- **THEN** 页面弹出全屏模态框显示原图（无缩略图参数），并提供下载与复用功能。
