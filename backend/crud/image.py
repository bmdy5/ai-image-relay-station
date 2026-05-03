from sqlalchemy.orm import Session
from ..models import models

def create_image_log(
    db: Session, 
    user_id: int, 
    prompt: str, 
    quality: str, 
    style: str,
    cost_points: int, 
    image_url: str = None, 
    ref_image_url: str = None,
    parent_id: int = None,
    iteration: int = 0,
    status: str = "success", 
    error_msg: str = None
):
    db_log = models.ImageLog(
        user_id=user_id,
        prompt=prompt,
        quality=quality,
        style=style,
        cost_points=cost_points,
        image_url=image_url,
        ref_image_url=ref_image_url,
        parent_id=parent_id,
        iteration=iteration,
        status=status,
        error_msg=error_msg
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_user_image_logs(db: Session, user_id: int, skip: int = 0, limit: int = 10, keyword: str = None):
    query = db.query(models.ImageLog).filter(
        models.ImageLog.user_id == user_id
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

def count_active_tasks(db: Session, user_id: int):
    return db.query(models.ImageLog).filter(
        models.ImageLog.user_id == user_id,
        models.ImageLog.status.in_(["pending", "generating", "storing"])
    ).count()

def reset_active_tasks(db: Session, user_id: int):
    # 查找所有挂起的任务
    pending_tasks = db.query(models.ImageLog).filter(
        models.ImageLog.user_id == user_id,
        models.ImageLog.status == "pending"
    ).all()
    
    if not pending_tasks:
        return
        
    # 计算需要退还的总积分
    total_refund = sum(task.cost_points for task in pending_tasks)
    
    # 执行退费
    db.query(models.User).filter(models.User.id == user_id).update(
        {models.User.points: models.User.points + total_refund}
    )
    
    # 标记任务为失败
    for task in pending_tasks:
        task.status = "failed"
        task.error_msg = "User manually reset task lock"
    
    db.commit()
