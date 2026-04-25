# security Specification

## Purpose
TBD - created by archiving change performance-ux-overhaul. Update Purpose after archive.
## Requirements
### Requirement: 创作隐私保护 (Private Storage)
系统 SHALL 将存储用户创作图片的 COS 桶设置为“私有读”。

#### Scenario: 签名链接访问
- **WHEN** 接口返回图片链接时
- **THEN** 系统 SHALL 动态生成带身份签名的临时链接（Signed URL），该链接 SHALL 在 1 小时后自动失效

### Requirement: 图片下载重试机制
系统在转存 AI 图片至 COS 期间，SHALL 具备基本的错误重试能力。

#### Scenario: 下载失败重试
- **WHEN** 从 AI 接口下载图片流失败
- **THEN** 系统 SHALL 自动重试最多 2 次，若均失败则执行扣费回滚

