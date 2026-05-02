## Why

目前的生图系统档位模糊，缺乏高溢价的差异化功能。用户难以通过简单的提示词获得专业级作品，且“图生图”等进阶功能尚未对会员解锁。通过引入分级提示词引擎和图生图能力，可以显著提升产品的专业壁垒和盈利能力。

## What Changes

- **计费调整 (BREAKING)**：将原有的积分档位重构为 5（初级）、10（中级）、15（高级）分级体系。
- **提示词模版引擎**：后端根据档位自动将用户输入封装为千字级专业指令。
- **图生图解锁**：正式为中级和高级用户开启参考图生图功能，并增强前端的上传引导。
- **交互升级**：前端实现动态占位符（Placeholder）预填、比例自由选择（1:1, 9:16, 16:9）及图片上传逻辑锁。

## Capabilities

### New Capabilities
- `prompt-wrapping-engine`: 根据选择的风格模版，自动将用户关键词包装为专业长指令。
- `image-to-image-ref`: 为中高级档位提供基于参考图的生图能力，包含前端约束提示。
- `dynamic-interaction-ui`: 实现风格选择后的自动填词、占位符更新及比例选择器。

### Modified Capabilities
- `image-quality-tiering`: 更新为 5/10/15 分级逻辑，并引入提示词驱动的“超高清”增强。
- `credits-system`: 调整扣费矩阵以匹配新的分级定价。
- `image-generation`: 增强接口逻辑以支持模版注入和参考图参数。

## Impact

- **Backend**: `backend/api/image.py` 需要重构生图逻辑，新增模版字典。
- **Frontend**: `HomePage.jsx` 需要重构参数调节区，新增比例选择器和智能引导逻辑。
- **Database**: `ImageLog` 记录中需确保能区分原始提示词与包装后的最终提示词。
