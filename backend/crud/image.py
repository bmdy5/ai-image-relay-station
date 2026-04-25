from sqlalchemy.orm import Session
from ..models import models

def create_image_log(
    db: Session, 
    user_id: int, 
    prompt: str, 
    quality: str, 
    cost_points: int, 
    image_url: str = None, 
    status: str = "success", 
    error_msg: str = None
):
    db_log = models.ImageLog(
        user_id=user_id,
        prompt=prompt,
        quality=quality,
        cost_points=cost_points,
        image_url=image_url,
        status=status,
        error_msg=error_msg
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_user_image_logs(db: Session, user_id: int, skip: int = 0, limit: int = 10, keyword: str = None):
    query = db.query(models.ImageLog).filter(
        models.ImageLog.user_id == user_id,
        models.ImageLog.status == "success"
    )
    if keyword:
        query = query.filter(models.ImageLog.prompt.ilike(f"%{keyword}%"))
    
    return query.order_by(models.ImageLog.created_at.desc()).offset(skip).limit(limit).all()

def get_daily_total_points(db: Session, day):
    from sqlalchemy import func
    return db.query(func.sum(models.ImageLog.cost_points)).filter(
        func.date(models.ImageLog.created_at) == day,
        models.ImageLog.status == "success"
    ).scalar() or 0
