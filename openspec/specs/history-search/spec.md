# history-search Specification

## Purpose
TBD - created by archiving change experience-enhancement. Update Purpose after archive.
## Requirements
### Requirement: 关键词检索接口 (MUST)
后端历史记录接口 MUST 支持可选的 `keyword` 参数。当传入该参数时，系统 MUST 仅返回 Prompt 内容中包含该关键词的记录。

#### Scenario: 搜索成功
- **WHEN** 用户请求 `/api/image/history?keyword=猫`
- **THEN** 返回的列表仅包含 Prompt 中有“猫”字的图片记录

### Requirement: 搜索组件交互 (MUST)
历史页面 MUST 在画廊上方提供一个搜索框，支持用户输入关键词。

#### Scenario: 实时搜索反馈
- **WHEN** 用户在搜索框输入文字
- **THEN** 系统在短暂延迟（防抖）后自动发起查询并更新画廊列表

