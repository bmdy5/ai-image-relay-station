## MODIFIED Requirements

### Requirement: 积分套餐展示 (Pricing Packages)
系统 SHALL 采用**横向滚动卡片**展示不同的积分充值套餐。大师版专属套餐 SHALL 具有显著的视觉区分度（如电光紫渐变及皇冠图标）。

#### Scenario: 浏览充值卡片
- **WHEN** 用户在会员页左右滑动套餐列表
- **THEN** 卡片伴随平滑的吸附感（Snap Effect）定位，且当前聚焦的卡片显示“最受欢迎”或“价值最高”等标识

### Requirement: 权益透明化对比 (Privilege Comparison)
页面底部 SHALL 展示不同创作档位的权益对比。大师版特权 SHALL 重点标注（如 4K 增强、优先生成、AI 创作笔记）。

#### Scenario: 查看大师版特权
- **WHEN** 用户滚动到会员页权益说明区
- **THEN** 系统以精致的勾选列表形式展示大师版独有的三项高级功能
