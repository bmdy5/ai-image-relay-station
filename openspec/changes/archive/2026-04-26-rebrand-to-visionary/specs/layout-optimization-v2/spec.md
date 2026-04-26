## ADDED Requirements

### Requirement: 结果预览区高度限制
系统 SHALL 为图片预览容器设置明确的最大高度限制（例如 75vh 或 calc(100vh - 150px)），防止长图导致页面垂直跨度过大。

#### Scenario: 加载超长图
- **WHEN** 生成一张长图（如信息图）
- **THEN** 预览容器 SHALL 保持在可视窗口内，且底部按钮 SHALL 可见

### Requirement: 图片比例自适应
系统 SHALL 使用 `object-fit: contain` 处理预览图片，确保任何比例的图片都能完整显示。

#### Scenario: 不同比例图切换
- **WHEN** 生成 1:1, 4:3 或长图
- **THEN** 图片 SHALL 在容器内居中完整显示，不发生拉伸或变形

### Requirement: 按钮防折行处理
系统 SHALL 为结果区的操作按钮设置 `white-space: nowrap` 属性。

#### Scenario: 文字内容较多
- **WHEN** 按钮文字包含“高清下载”等较长词汇
- **THEN** 按钮文字 SHALL 保持在一行内，不得发生强制折行
