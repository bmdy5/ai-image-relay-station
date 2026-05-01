from backend.models.database import SessionLocal
from backend.models import models
import httpx
import anyio

async def probe_api():
    db = SessionLocal()
    try:
        # 1. 从库里拿配置
        configs = db.query(models.SystemConfig).all()
        config_dict = {c.config_key: c.config_value for c in configs}
        
        base_url = config_dict.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
        api_key = config_dict.get("OPENAI_API_KEY", "NOT_SET")
        
        print(f"--- [Audit] Probing API: {base_url} ---")
        print(f"--- [Audit] API Key (Prefix): {api_key[:10]}... ---")
        
        # 2. 探测模型列表
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.get(
                    f"{base_url}/models",
                    headers={"Authorization": f"Bearer {api_key}"}
                )
                if resp.status_code == 200:
                    models_data = resp.json()
                    model_ids = [m.get("id") for m in models_data.get("data", [])]
                    print(f"--- [Success] Supported Models: {model_ids} ---")
                    
                    # 关键检测：是否有 MJ 或特定的生图模型
                    has_mj = any("mj" in m.lower() or "midjourney" in m.lower() for m in model_ids)
                    print(f"--- [Analysis] Img2Img Support (MJ Detected): {'YES' if has_mj else 'NO'} ---")
                else:
                    print(f"--- [Error] Failed to fetch models: {resp.status_code} | {resp.text} ---")
            except Exception as e:
                print(f"--- [Error] Connection failed: {e} ---")
                
    finally:
        db.close()

if __name__ == "__main__":
    anyio.run(probe_api)
