## MODIFIED Requirements

### Requirement: 个人创作看板 (User Dashboard)
个人中心顶部 SHALL 展示用户状态看板，包含：头像、UID、当前积分余额（显眼展示）及累计创作数量。

#### Scenario: 查看积分余额
- **WHEN** 用户进入“我的”页面
- **THEN** 系统在顶部橙色渐变区域以超大字号展示当前可用积分，并提供快速充值入口

### Requirement: 模块化设置菜单 (Settings Menu)
系统设置及辅助功能 SHALL 采用 **Apple 风格的分组列表**。每个功能项 SHALL 包含精致图标及右侧箭头指示器。

#### Scenario: 进入意见反馈
- **WHEN** 用户点击“意见反馈”项
- **THEN** 系统弹出全屏反馈模态框，且输入区域应用 20px 圆角
活跃的常规 Chrome 实例。
