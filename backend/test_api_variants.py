from backend.models.database import SessionLocal
from backend.models import models
import httpx
import anyio
import uuid
import traceback
import json

TEST_IMAGE_URL = "https://img.yzcdn.cn/vant/cat.jpeg"

async def test_payload_variants():
    db = SessionLocal()
    try:
        configs = db.query(models.SystemConfig).all()
        config_dict = {c.config_key: c.config_value for c in configs}
        base_url = config_dict.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
        api_key = config_dict.get("OPENAI_API_KEY", "NOT_SET")
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            variants = [
                ("MJ_STYLE", {"model": "gpt-image-2", "prompt": f"{TEST_IMAGE_URL} a cute cat", "n": 1, "size": "1024x1024"}),
                ("FIELD_IMAGE_URL", {"model": "gpt-image-2", "prompt": "a cute cat", "image_url": TEST_IMAGE_URL, "n": 1, "size": "1024x1024"}),
                ("ARRAY_IMAGES", {"model": "gpt-image-2", "prompt": "a cute cat", "images": [TEST_IMAGE_URL], "n": 1, "size": "1024x1024"}),
            ]
            
            for name, payload in variants:
                print(f"\n>>> [Testing Variant: {name}]")
                try:
                    resp = await client.post(
                        f"{base_url}/images/generations",
                        headers={"Authorization": f"Bearer {api_key}"},
                        json=payload
                    )
                    print(f"Status Code: {resp.status_code}")
                    try:
                        data = resp.json()
                        print(f"Full JSON Response: {json.dumps(data, indent=2)}")
                    except:
                        print(f"Raw Text Response: {resp.text[:500]}")
                except Exception:
                    traceback.print_exc()
                
    finally:
        db.close()

if __name__ == "__main__":
    anyio.run(test_payload_variants)
