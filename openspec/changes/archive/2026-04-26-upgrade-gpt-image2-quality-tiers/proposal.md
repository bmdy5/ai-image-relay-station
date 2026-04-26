## Why

目前系统的生图规格（标准、高清、大师）在后端实现上完全一致，均调用同一个模型且参数相同，导致用户支付更高积分（10/15分）却得不到差异化的体验。为了提升产品的高级感、增加高客单价转化并充分发挥 GPT Image 2 模型的能力，需要实现真正的阶梯化服务。

## What Changes

- **模型参数动态化**：根据前端传入的 `quality` 参数，动态调整 API 调用的模型参数。
- **分辨率阶梯化**：标准版维持基础分辨率，高清版与大师版提供更高分辨率。
- **深度思考模式（HD）**：在大师版中开启 `quality: "hd"` 参数，激活模型视觉推理能力。
- **UI 状态解锁**：恢复前端 HomePage 中被置灰的“高清版”、“大师版”和“继续编辑”按钮，并确保它们对应真实的后台处理逻辑。

## Capabilities

### New Capabilities
- `image-quality-tiering`: 实现根据不同定价档位分发不同的模型参数（分辨率、质量系数）。
- `extended-image-editing`: 开启 GPT Image 2 支持的自然语言多轮编辑功能接口。

### Modified Capabilities
- 无

## Impact

- **backend/api/image.py**: 修改 `process_image_task` 逻辑，增加参数分发。
- **frontend/src/pages/HomePage.jsx**: 解除 UI 禁用状态，适配新的生成逻辑。
- **backend/core/utils.py**: 核对 `PRICING` 配置确保一致。
