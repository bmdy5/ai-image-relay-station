## ADDED Requirements

### Requirement: 核心优势展示区
系统 SHALL 在首页底部（生图操作区下方）新增一个模块，展示产品的核心竞争力。

#### Scenario: 浏览优势模块
- **WHEN** 用户向下滚动首页
- **THEN** SHALL 看到包含“自由计费”、“无需翻墙”、“无限制创作”、“零风控”四个核心点的展示区域

### Requirement: 响应式网格布局
展示区 SHALL 采用响应式设计，在桌面端显示为多列，在移动端自动堆叠。

#### Scenario: 屏幕缩放测试
- **WHEN** 窗口宽度小于 768px
- **THEN** 优势模块 SHALL 自动切换为单列或双列布局，保持文字可读性
