"""服饰图片分析 — 调用 qwen-vl-max 提取结构化服饰属性"""
import httpx
import json
from backend.core.config import get_config

ANALYSIS_PROMPT = """分析图中服饰，返回 JSON（仅 JSON，无其他文字）：
{
  "category": "上衣/裤子/连衣裙/外套/半身裙",
  "color": "颜色",
  "neckline": "圆领/V领/方领/高领/翻领/无",
  "sleeve": "无袖/短袖/中袖/长袖",
  "waist": "收腰/宽松/正常",
  "hem": "直筒/A字/鱼尾/不规则/无",
  "pattern": "纯色/条纹/格子/碎花/印花",
  "material": "棉/麻/丝/针织/牛仔/皮革/雪纺",
  "fit": "紧身/修身/宽松/oversize",
  "length": "短款/常规/中长/长款",
  "details": "纽扣/拉链/腰带/褶皱/蕾丝 等额外细节"
}"""


async def analyze_clothing(image_base64: str) -> dict:
    """分析服饰图片，返回结构化属性字典"""
    key = get_config("DASHSCOPE_API_KEY")
    if not key:
        print("--- [Clothing Analyzer] No DASHSCOPE_API_KEY, using defaults ---")
        return _default_analysis()

    # 确保 Base64 带 data URI 前缀
    if not image_base64.startswith("data:image"):
        image_base64 = f"data:image/png;base64,{image_base64}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}"},
                json={
                    "model": "qwen-vl-max",
                    "messages": [{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": ANALYSIS_PROMPT},
                            {"type": "image_url", "image_url": {"url": image_base64}}
                        ]
                    }],
                    "temperature": 0.1,
                    "max_tokens": 300
                }
            )

        if resp.status_code != 200:
            print(f"--- [Clothing Analyzer] API error: {resp.status_code} ---")
            return _default_analysis()

        raw = resp.json()["choices"][0]["message"]["content"].strip()
        # 清理 markdown 代码块包裹
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1]
            if raw.endswith("```"):
                raw = raw[:-3]
        result = json.loads(raw)
        print(f"--- [Clothing Analyzer] {json.dumps(result, ensure_ascii=False)} ---")
        return result

    except Exception as e:
        print(f"--- [Clothing Analyzer] Failed: {e} ---")
        return _default_analysis()


def _default_analysis() -> dict:
    return {
        "category": "服装", "color": "", "neckline": "", "sleeve": "",
        "waist": "", "hem": "", "pattern": "", "material": "",
        "fit": "修身", "length": "", "details": ""
    }


def clothing_to_prompt(analysis: dict) -> str:
    """将分析结果转为自然语言服饰描述"""
    parts = []
    if analysis.get("color"):
        parts.append(analysis["color"])
    if analysis.get("fit"):
        parts.append(analysis["fit"] + "版型")
    if analysis.get("neckline"):
        parts.append(analysis["neckline"])
    if analysis.get("sleeve"):
        parts.append(analysis["sleeve"])
    if analysis.get("waist") and analysis["waist"] != "正常":
        parts.append(analysis["waist"] + "设计")
    if analysis.get("hem") and analysis["hem"] != "无":
        parts.append(analysis["hem"] + "下摆")
    if analysis.get("length"):
        parts.append(analysis["length"])
    if analysis.get("material"):
        parts.append(analysis["material"] + "面料")
    if analysis.get("pattern") and analysis["pattern"] != "纯色":
        parts.append(analysis["pattern"] + "图案")
    if analysis.get("category"):
        parts.append(analysis["category"])
    if analysis.get("details"):
        parts.append(f"细节：{analysis['details']}")

    return "，".join(parts) if parts else "时尚服饰"
