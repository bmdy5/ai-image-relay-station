import httpx
import time
from backend.core.config import get_config

# 风格语义参考字典（用于给 AI 提供上下文，不参与最终 Template 包装）
STYLE_CONTEXT = {
    "default": "通用高质量风格",
    "real": "极致写实摄影，注重皮肤肌理与自然光影",
    "product": "白底电商产品主图，打光精致",
    "tech_poster": "科技感海报，构图严谨，具有现代感",
    "travel": "旅游杂志长图，多场景组合",
    "interior": "高端室内设计，空间通透，极简美学",
    "live_stream": "真实直播间截图，还原互动UI与现场感",
    "eri_silhouette": "轮廓宇宙，收藏级叙事海报，史诗感",
    "silk_road": "宋代山水意境，高级国风，电影感光影",
    "vintage_5s": "iPhone 5s 闪光灯随手拍，复古胶片质感",
    "relation_map": "人物关系图谱，逻辑清晰且具海报设计感",
    "encyclopedia": "科普百科图鉴，模块化排版，具有收藏价值"
}

SYSTEM_PROMPT = """你是一个专业的 AI 绘画提示词润色助手。
你的核心任务是：
1. 识别用户输入语言（中文或英文），并使用【相同语言】进行润色输出。
2. 扮演“辅助者”角色：在保持用户原始意图的基础上，扩充细节（如材质、光影、微表情、构图、环境氛围），使画面更具高级感。
3. 【禁止】生造用户未提及的主体，【禁止】添加与当前风格冲突的艺术风格词。
4. 如果提供了风格上下文，请确保扩充的内容在审美上与该风格保持高度一致。
5. 输出结果仅包含润色后的文字，严禁包含任何前缀（如“润色结果：”）、解释、引号或转义字符。
6. 结果控制在 120 字以内。"""

async def enhance_prompt(raw_prompt: str, style_id: str = "default") -> str:
    """
    调用文本大模型优化用户提示词。
    支持通义千问 (Qwen) 优先，并根据输入的语种自适应回复。
    """
    # 获取配置
    dashscope_key = get_config("DASHSCOPE_API_KEY")
    openai_key = get_config("OPENAI_API_KEY")
    
    if not dashscope_key and not openai_key:
        raise Exception("未配置 AI 接口密钥 (DASHSCOPE_API_KEY 或 OPENAI_API_KEY)")

    # 确定模型与接口地址
    if dashscope_key:
        api_key = dashscope_key
        base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
        model = "qwen-plus"
    else:
        api_key = openai_key
        base_url = get_config("OPENAI_BASE_URL", "https://api.openai.com/v1")
        model = "gpt-4o-mini"

    # 构建针对风格的动态指令
    style_desc = STYLE_CONTEXT.get(style_id, "通用艺术风格")
    user_content = f"用户当前选定的画面风格是：【{style_desc}】。\n用户输入的原始提示词是：【{raw_prompt}】。\n请基于此进行润色。"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_content}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 300
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"API 请求失败: {response.status_code}")
                
            data = response.json()
            enhanced = data["choices"][0]["message"]["content"].strip()
            
            # 清理可能的引号包裹（针对某些模型输出习惯）
            if (enhanced.startswith('"') and enhanced.endswith('"')) or \
               (enhanced.startswith('“') and enhanced.endswith('”')):
                enhanced = enhanced[1:-1]
                
            return enhanced
    except Exception as e:
        print(f"--- [Enhance Error] {str(e)} ---")
        raise e
