## Why

用户在浏览“我的创作”历史画廊时，经常需要基于之前的成功作品进行再次创作或 Prompt 微调。目前缺乏直接的衔接手段，用户必须手动复制并切换页面粘贴，流程繁琐。

## What Changes

- **画廊交互增强**：在“我的创作”页面的图片项及预览模态框中，新增“一键复用”或“填入”按钮。
- **跨页面自动填充**：点击按钮后，系统需自动携带选中的 Prompt 跳转至首页，并将其预填入生图输入框，方便用户立即开始新创作。

## Capabilities

### New Capabilities
- `prompt-auto-fill`: 定义 Prompt 的跨页面传递协议及首页输入框的自动填充行为。

### Modified Capabilities
- 无

## Impact

- **Frontend**: 修改 `HistoryPage.jsx` 增加按钮与跳转逻辑；修改 `HomePage.jsx` 增加对 URL 参数或本地存储中 Prompt 信息的监听与自动填入。
- **Storage**: 可能使用 `localStorage` 或 `sessionStorage` 临时存储待复用的 Prompt 内容。
