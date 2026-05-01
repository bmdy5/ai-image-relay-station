## 1. 后端计费与配置更新

- [x] 1.1 在 `backend/api/image.py` 中更新 `PRICING` 字典为 `{"standard": 5, "hd": 10, "master": 15}`
- [x] 1.2 在 `backend/api/image.py` 中更新 `TIER_CONFIG` 以匹配新的分辨率分级
- [x] 1.3 确保后端接口逻辑支持接收 `image_url` 作为参考图输入（针对中高级用户）

## 2. 提示词模版引擎实现

- [x] 2.1 在 `backend/api/image.py` 中建立 `STYLE_PROMPT_TEMPLATES` 模版库（从手册同步全量内容）
- [x] 2.2 在 `process_image_task` 中集成 `wrap_prompt` 函数逻辑，支持 `【】` 变量替换与兜底策略
- [x] 2.3 为 15 积分的 Master 档位逻辑新增“超高清”画质后缀的强制注入逻辑

## 3. 前端交互升级

- [x] 3.1 在 `HomePage.jsx` 中完善 `styles` 配置数组，增加 `placeholder` 和 `requiresImage` 字段
- [x] 3.2 实现风格切换时的“自动填词”逻辑，并集成弹窗（使用原生 confirm）进行“覆盖确认”提醒
- [x] 3.3 实现图片上传的逻辑锁：若选中 `requiresImage` 风格且无图，禁用生成按钮并显示警告
- [x] 3.4 在“参数微调”区移除占位符，实现真实的 1:1, 9:16, 16:9 比例选择器

## 4. 联调与验证

- [x] 4.1 验证 5/10/15 积分扣减是否与预期档位一致
- [x] 4.2 验证 Master 档位输出的提示词是否包含超高清增强描述词
- [x] 4.3 验证图生图功能在选择“iPhone 5s 纪实”等风格时是否正确校验并透传图片
