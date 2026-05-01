from backend.models.database import SessionLocal
from backend.models import models
import httpx
import anyio
import io

async def test_edits_multipart():
    db = SessionLocal()
    try:
        configs = db.query(models.SystemConfig).all()
        config_dict = {c.config_key: c.config_value for c in configs}
        base_url = config_dict.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
        api_key = config_dict.get("OPENAI_API_KEY", "NOT_SET")
        
        # 准备一个简单的测试图片 (1x1 红色像素的 PNG)
        # 实际测试时建议用真实图片，这里我们先探测接口是否通畅
        test_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\x0dc\x44\xaf\x00\x00\x00\x00IEND\xaeB`\x82'
        
        print(f"\n>>> [Testing /v1/images/edits with Multipart/Form-Data]")
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {
                "image": ("test.png", io.BytesIO(test_image_content), "image/png")
            }
            data = {
                "prompt": "a futuristic red crystal based on this color",
                "model": "gpt-image-2",
                "n": 1,
                "size": "1024x1024",
                "input_fidelity": "high"  # 开启高保真模式
            }
            
            resp = await client.post(
                f"{base_url}/images/edits",
                headers={"Authorization": f"Bearer {api_key}"},
                files=files,
                data=data
            )
            
            print(f"Status Code: {resp.status_code}")
            try:
                result = resp.json()
                import json
                print(f"Response JSON: {json.dumps(result, indent=2)}")
            except:
                print(f"Raw Response: {resp.text[:500]}")
                
    finally:
        db.close()

if __name__ == "__main__":
    anyio.run(test_edits_multipart)
