## ADDED Requirements

### Requirement: 后端下载中转代理 (MUST)
系统 MUST 提供一个后端接口，接收图片 URL 参数，流式读取远程图片资源并将其转发给前端，以绕过 CDN 的跨域下载限制。

#### Scenario: 代理下载成功
- **WHEN** 前端请求 `GET /api/images/download?url=xxx`
- **THEN** 后端返回 200 状态码，响应头包含 `Content-Disposition: attachment`，且响应体为图片二进制流

### Requirement: 强制浏览器触发下载 (MUST)
下载接口返回的响应头 MUST 包含 `Content-Type`（匹配原图类型）和文件名，确保浏览器不会直接在新窗口打开图片。

#### Scenario: 触发文件下载对话框
- **WHEN** 用户点击“下载”按钮并调用代理接口
- **THEN** 浏览器弹出文件保存对话框，默认文件名为 `creation_[timestamp].png`
