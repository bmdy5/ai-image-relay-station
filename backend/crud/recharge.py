from sqlalchemy.orm import Session
from ..models import models

def create_recharge_log(db: Session, user_id: int, amount: int, operator_id: int):
    db_log = models.RechargeLog(
        user_id=user_id,
        amount=amount,
        operator_id=operator_id
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_recharge_history(db: Session, limit: int = 20):
    return db.query(models.RechargeLog).order_by(
        models.RechargeLog.created_at.desc()
    ).limit(limit).all()
