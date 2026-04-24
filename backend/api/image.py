from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx
import os
from sqlalchemy import func
from datetime import datetime, date
from ..models.database import get_db
from ..models import models
from ..schemas import image as image_schema
from ..crud import image as image_crud
from ..core.deps import get_current_user

router = APIRouter(prefix="/image", tags=["image"])

# 积分配置 (严格遵循定价文档)
PRICING = {
    "low": 1,
    "mid": 10,
    "high": 30
}

# 敏感词库 (示例)
SENSITIVE_WORDS = ["政治", "色情", "暴力", "毒品"]
# 单日全站积分限额 (50 美元约等于 3500 积分)
DAILY_POINTS_LIMIT = 3500

@router.post("/generate")
async def generate_image(
    payload: image_schema.ImageCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. 敏感词拦截 (Task 6.4)
    for word in SENSITIVE_WORDS:
        if word in payload.prompt:
            raise HTTPException(status_code=400, detail=f"提示词包含敏感内容: {word}")

    # 2. 消费熔断校验 (Task 6.3)
    today = date.today()
    total_spent = db.query(func.sum(models.ImageLog.cost_points)).filter(
        func.date(models.ImageLog.created_at) == today,
        models.ImageLog.status == "success"
    ).scalar() or 0
    
    if total_spent >= DAILY_POINTS_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="系统单日限额已达上限，请明天再试"
        )

    # 3. 校验规格合法性
    if payload.quality not in PRICING:
        raise HTTPException(status_code=400, detail="无效的画质规格")
    
    cost = PRICING[payload.quality]
    
    # 2. 校验余额是否充足 (Task 3.4)
    if current_user.points < cost:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"积分不足，当前需要 {cost} 积分，余额 {current_user.points}"
        )
    
    # 3. 对接 OpenAI API (Task 3.1)
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{base_url}/images/generations",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "gpt-image-2", # 或 dall-e-3，根据实际模型ID修改
                    "prompt": payload.prompt,
                    "n": 1,
                    "size": "1024x1024",
                    "quality": "standard" if payload.quality == "low" else "hd"
                }
            )
            
            if response.status_code != 200:
                # 记录失败日志 (Task 3.3)
                image_crud.create_image_log(
                    db, user_id=current_user.id, prompt=payload.prompt,
                    quality=payload.quality, cost_points=0, status="failed",
                    error_msg=response.text
                )
                raise HTTPException(status_code=500, detail="OpenAI 服务调用失败")
            
            data = response.json()
            image_url = data['data'][0]['url']
            
            # 4. 扣除积分并记录成功日志 (Task 3.2 & 3.3)
            current_user.points -= cost
            image_crud.create_image_log(
                db, user_id=current_user.id, prompt=payload.prompt,
                quality=payload.quality, cost_points=cost, 
                image_url=image_url, status="success"
            )
            db.commit()
            
            return {"image_url": image_url, "remaining_points": current_user.points}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"系统内部错误: {str(e)}")
