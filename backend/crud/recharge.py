from sqlalchemy.orm import Session
from ..models import models
from fastapi import HTTPException, status

def create_recharge_apply(db: Session, user_id: int, money_amount: int, screenshot_url: str = None):
    # 检查是否已有 Pending 订单
    pending_exists = db.query(models.RechargeLog).filter(
        models.RechargeLog.user_id == user_id,
        models.RechargeLog.status == "pending"
    ).first()
    
    if pending_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="您已有申请正在审核中，请稍后再试"
        )
    
    # 1元 = 10积分
    points_amount = money_amount * 10
    
    db_log = models.RechargeLog(
        user_id=user_id,
        money_amount=money_amount,
        amount=points_amount,
        screenshot_url=screenshot_url,
        status="pending"
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_pending_recharges(db: Session):
    return db.query(models.RechargeLog).filter(models.RechargeLog.status == "pending").all()

def audit_recharge(db: Session, log_id: int, admin_id: int, approved: bool, admin_note: str = None):
    db_log = db.query(models.RechargeLog).filter(models.RechargeLog.id == log_id).with_for_update().first()
    if not db_log or db_log.status != "pending":
        raise HTTPException(status_code=404, detail="未找到待审核订单")
    
    if approved:
        db_log.status = "success"
        # 增加用户积分
        user = db.query(models.User).filter(models.User.id == db_log.user_id).with_for_update().first()
        if user:
            user.points += db_log.amount
    else:
        db_log.status = "rejected"
    
    db_log.admin_note = admin_note
    db_log.operator_id = admin_id
    
    db.commit()
    db.refresh(db_log)
    return db_log
