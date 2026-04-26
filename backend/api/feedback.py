from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from backend.models.database import get_db
from backend.models import models
from backend.core.deps import get_current_user, get_optional_current_user
from backend.schemas import feedback as feedback_schema

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.post("/submit")
async def submit_feedback(
    payload: feedback_schema.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_optional_current_user)
):
    """提交意见反馈"""
    new_feedback = models.Feedback(
        user_id=current_user.id if current_user else None,
        content=payload.content,
        contact=payload.contact
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return {"message": "提交成功", "id": new_feedback.id}

@router.get("/list", response_model=List[feedback_schema.FeedbackRead])
async def get_feedback_list(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """获取反馈列表 (仅管理员)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="无权访问管理接口")
    
    feedbacks = db.query(models.Feedback).order_by(models.Feedback.created_at.desc()).offset(skip).limit(limit).all()
    return feedbacks

@router.patch("/{id}")
async def update_feedback_status(
    id: int,
    payload: feedback_schema.FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """更新反馈状态 (仅管理员)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="无权访问管理接口")
    
    fb = db.query(models.Feedback).filter(models.Feedback.id == id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="反馈不存在")
    
    if payload.status:
        fb.status = payload.status
    if payload.admin_note:
        fb.admin_note = payload.admin_note
        
    db.commit()
    return {"message": "更新成功"}
