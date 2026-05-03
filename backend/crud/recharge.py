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
    
    # 优惠套餐逻辑：10->150, 30->500, 50->800, 其余 1:10
    if money_amount == 10:
        points_amount = 150
    elif money_amount == 30:
        points_amount = 500
    elif money_amount == 50:
        points_amount = 800
    else:
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
    # 只返回“人工报备”的订单（即没有商户单号的订单），在线订单由系统自动处理
    return db.query(models.RechargeLog).filter(
        models.RechargeLog.status == "pending",
        models.RechargeLog.out_trade_no == None
    ).all()

def audit_recharge(db: Session, log_id: int, admin_id: int, approved: bool, admin_note: str = None):
    db_log = db.query(models.RechargeLog).filter(models.RechargeLog.id == log_id).with_for_update().first()
    if not db_log or db_log.status != "pending":
        raise HTTPException(status_code=404, detail="未找到待审核订单")
    
    # 安全逻辑：严禁管理员手动干预在线订单
    if db_log.out_trade_no:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="在线支付订单由系统自动处理，严禁人工干预，以防重复加分")
    
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

def can_receive_invitation_reward(db: Session, inviter_id: int):
    """检查邀请人今日是否已达 5 次奖励上限"""
    from datetime import datetime, time, timedelta
    # 转换为北京时间 (UTC+8)
    now = datetime.utcnow() + timedelta(hours=8)
    today_start = datetime.combine(now.date(), time.min) - timedelta(hours=8) # 转回 UTC 比较
    
    count = db.query(models.RechargeLog).filter(
        models.RechargeLog.user_id == inviter_id,
        models.RechargeLog.trade_no.like("INVITE_REWARD_%"),
        models.RechargeLog.created_at >= today_start
    ).count()
    return count < 5

def is_invitee_rewarded(db: Session, invitee_id: int):
    """检查该受邀者是否已经为邀请人贡献过奖励"""
    # 通过 trade_no 或 admin_note 检查
    return db.query(models.RechargeLog).filter(
        models.RechargeLog.trade_no.like(f"INVITE_REWARD_{invitee_id}_%")
    ).first() is not None

def create_recharge_log(db: Session, user_id: int, amount: int, operator_id: int = 0, status: str = "success", admin_note: str = "系统充值", trade_no: str = None):
    db_log = models.RechargeLog(
        user_id=user_id,
        amount=amount,
        money_amount=0,
        status=status,
        admin_note=admin_note,
        operator_id=operator_id,
        trade_no=trade_no or f"REWARD_{user_id}_{int(__import__('time').time())}"
    )
    db.add(db_log)
    return db_log
