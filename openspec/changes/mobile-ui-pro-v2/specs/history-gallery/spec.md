## MODIFIED Requirements

### Requirement: 历史记录展示 (History Gallery)
系统 SHALL 采用**双列瀑布流**布局展示用户历史生图记录。每张图片卡片 SHALL 包含档位标记（如 ✦ 或 HD）及简短的提示词摘要。

#### Scenario: 画廊浏览
- **WHEN** 用户进入历史页面
- **THEN** 系统以两列交错排列的形式展示图片，且加载过程 SHALL 平滑（如使用骨架屏）

### Requirement: 快捷复用与详情 (Quick Reuse & Detail)
点击历史图片 SHALL 弹出详情抽屉。详情中 SHALL 提供“一键复用提示词”按钮，点击后系统 SHALL 自动跳转回首页并填充提示词到输入框。

#### Scenario: 提示词复用
- **WHEN** 用户在详情页点击“复用提示词”
- **THEN** 系统切换到首页 Tab，并将该图片的提示词填入底部输入框，且保持当前选中的档位
