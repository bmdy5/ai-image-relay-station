## ADDED Requirements

### Requirement: 修改密码校验
用户必须提供正确的旧密码才能设置新密码。

#### Scenario: 成功修改密码
- **WHEN** 用户提供正确的旧密码和符合强度要求的正新密码
- **THEN** 后端更新 `password_hash` 并返回成功状态

#### Scenario: 旧密码错误
- **WHEN** 用户提供的旧密码与数据库存储的不一致
- **THEN** 返回 401 Unauthorized 错误

### Requirement: 积分明细展示
用户应能看到自己所有成功的生图记录及其消耗的积分。

#### Scenario: 查看明细
- **WHEN** 用户访问个人中心明细页
- **THEN** 返回该用户按时间倒序排列的 `ImageLog` 列表
