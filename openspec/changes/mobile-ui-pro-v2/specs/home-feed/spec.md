## ADDED Requirements

### Requirement: 对话式结果堆叠流 (Conversational Result Stack)
系统 SHALL 支持以垂直流的形式堆叠多个生图结果。用户发送新指令后，新任务卡片 SHALL 出现在流的底部，且页面 SHALL 自动平滑滚动到最新卡片。

#### Scenario: 连续生图交互
- **WHEN** 用户在已有一张生图结果的情况下，再次点击“发送”按钮
- **THEN** 系统在现有结果下方追加一个新的生图卡片，并自动滚动到底部

### Requirement: 嵌入式思维矩阵动画 (Embedded Thinking Matrix)
在大师版 (Master) 模式下，生图中的卡片 SHALL 展示独立的粒子流动画及“思维矩阵”关键词序列（如：语义分析、光影渲染等）。

#### Scenario: 大师版生图反馈
- **WHEN** 用户以“大师版”档位启动生图
- **THEN** 对应卡片区域显示紫色粒子脉冲动画，并轮播显示 AI 推理步骤文本

### Requirement: 智能功能坞与抽屉 (Intelligent Dock & Drawers)
系统 SHALL 提供一个悬浮在底部的功能坞，点击档位、风格等按钮 SHALL 弹出半屏遮罩抽屉 (Bottom Drawer)，而非全屏弹窗。

#### Scenario: 切换档位抽屉
- **WHEN** 用户点击功能坞上的“档位”按钮
- **THEN** 系统从底部弹出包含 Standard/HD/Master 详细说明的抽屉，背景应用毛玻璃模糊效果
