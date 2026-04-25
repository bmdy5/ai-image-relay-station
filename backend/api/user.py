from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..models.database import get_db
from ..models import models
from ..schemas import image as image_schema, user as user_schema
from ..crud import recharge as recharge_crud
from ..core.deps import get_current_user

router = APIRouter(prefix="/user", tags=["user"])

@router.post("/recharge/apply")
def apply_recharge(
    data: user_schema.RechargeApply,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if data.money_amount < 10:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="最低充值金额为 10 元")
    
    return recharge_crud.create_recharge_apply(
        db, 
        user_id=current_user.id, 
        money_amount=data.money_amount, 
        screenshot_url=data.screenshot_url
    )

@router.get("/consumption", response_model=List[image_schema.ImageLogInfo])
def get_consumption_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 按时间倒序返回当前用户的生图记录
    logs = db.query(models.ImageLog).filter(
        models.ImageLog.user_id == current_user.id
    ).order_by(models.ImageLog.created_at.desc()).all()
    return logs
