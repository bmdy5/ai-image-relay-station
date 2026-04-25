from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..models.database import get_db
from ..models import models
from ..schemas import image as image_schema
from ..core.deps import get_current_user

router = APIRouter(prefix="/user", tags=["user"])

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
