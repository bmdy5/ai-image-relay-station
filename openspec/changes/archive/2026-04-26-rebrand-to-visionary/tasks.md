## 1. 品牌更名与全局替换

- [x] 1.1 在 `HomePage.jsx` 中将 "GPT Image 2" 统一替换为 "Visionary"。
- [x] 1.2 在导航栏 Logo 处增加副标题 "基于 GPT Image V2 构建"。
- [x] 1.3 更新 `backend/api/image.py` 中的性能日志报表头，改为 "[Performance Report] Visionary | ..."。

## 2. UI 布局精细化调整

- [x] 2.1 修改 `HomePage.jsx` 中结果预览容器的 style，设置 `maxHeight` 和 `overflowY: 'auto'`。
- [x] 2.2 为预览图片设置 `object-fit: 'contain'` 和 `maxHeight`。
- [x] 2.3 为操作按钮增加 `whiteSpace: 'nowrap'` 并优化 Flex 布局，解决折行问题。

## 3. 首页底部优势展示区

- [x] 3.1 在 `HomePage.jsx` 底部（生图操作区下方）新增 `FeatureShowcase` 模块。
- [x] 3.2 实现 4 大核心优势（自由计费、无需翻墙、无限制创作、零风控）的文案排版。
- [x] 3.3 使用 Lucide-react 图标并配合 Grid 布局，增强视觉吸引力。

## 4. 验证与测试

- [x] 4.1 验证长图加载时的预览效果，确保不撑破页面。
- [x] 4.2 验证不同屏幕尺寸下的响应式布局。
- [x] 4.3 确认后端日志输出品牌名正确。
