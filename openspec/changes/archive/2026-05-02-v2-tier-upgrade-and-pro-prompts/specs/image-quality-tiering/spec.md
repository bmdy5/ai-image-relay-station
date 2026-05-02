## MODIFIED Requirements

### Requirement: 动态参数分发
系统必须根据用户请求中的 `quality` 字段（standard/hd/master），动态映射并分发相应的模型参数。

#### Scenario: 标准版请求
- **WHEN** 用户选择“标准版”提交生图任务
- **THEN** 系统向 API 发送 `model: "gpt-image-2"`, `size: "1024x1024"` 且积分扣除 5 分

#### Scenario: 高清版请求
- **WHEN** 用户选择“高清版”提交生图任务
- **THEN** 系统向 API 发送 `model: "gpt-image-2"`, `size: "1024x1536"` 且积分扣除 10 分

#### Scenario: 大师版请求
- **WHEN** 用户选择“大师版”提交生图任务
- **THEN** 系统向 API 发送 `model: "gpt-image-2"`, `size: "1024x1792"`，积分扣除 15 分，并在提示词末尾注入超高清增强描述词
