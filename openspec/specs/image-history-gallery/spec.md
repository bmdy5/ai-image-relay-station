# image-history-gallery Specification

## Purpose
TBD - created by archiving change user-creation-gallery. Update Purpose after archive.
## Requirements
### Requirement: 获取用户历史生图记录 (MUST)
系统 MUST 允许登录用户通过 API 获取其过往所有成功的生图记录，支持按时间倒序排列。

#### Scenario: 成功加载历史列表
- **WHEN** 用户进入“我的创作”页面
- **THEN** 系统发起 `GET /api/images/history` 请求并返回带图片 URL 和 Prompt 的列表

### Requirement: 瀑布流响应式展示 (MUST)
前端画廊 MUST 能够根据屏幕宽度自动调整列数（如：手机 2 列，桌面 4-5 列），并保持图片比例不失真。

#### Scenario: 响应式列数切换
- **WHEN** 用户在桌面端将浏览器窗口缩小至手机尺寸
- **THEN** 图片墙自动从多列重排为 2 列

### Requirement: 图片预览详情 (MUST)
系统 MUST 支持点击画廊中的缩略图以弹出模态框（Modal）展示高清原图。

#### Scenario: 打开预览模态框
- **WHEN** 用户点击画廊中的一张图片
- **THEN** 页面弹出全屏模态框显示原图，并提供关闭按钮和下载按钮

