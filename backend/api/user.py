from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..models.database import get_db
from ..models import models
from ..schemas import image as image_schema, user as user_schema
from ..crud import recharge as recharge_crud
from ..core.deps import get_current_user
from ..core.utils import get_beijing_time

router = APIRouter(prefix="/user", tags=["user"])

@router.post("/recharge/apply")
def apply_recharge(
    data: user_schema.RechargeApply,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if data.money_amount < 1:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="充值金额无效")
    
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

@router.get("/recharge/history", response_model=List[user_schema.RechargeLogInfo])
def get_recharge_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 只返回充值成功的记录
    logs = db.query(models.RechargeLog).filter(
        models.RechargeLog.user_id == current_user.id,
        models.RechargeLog.status == "success"
    ).order_by(models.RechargeLog.created_at.desc()).all()
    return logs

@router.post("/redeem")
def redeem_code(
    data: user_schema.RedemptionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. 查找兑换码并加锁（防止超卖）
    code_obj = db.query(models.RedemptionCode).filter(
        models.RedemptionCode.code == data.code,
        models.RedemptionCode.is_active == True
    ).with_for_update().first()
    
    if not code_obj:
        raise HTTPException(status_code=400, detail="兑换码无效或已关闭")
    
    # 2. 时间有效期校验
    now = get_beijing_time()
    if code_obj.start_time and now < code_obj.start_time:
        raise HTTPException(status_code=400, detail="兑换活动尚未开始")
    if code_obj.end_time and now > code_obj.end_time:
        raise HTTPException(status_code=400, detail="兑换活动已结束")
    
    # 3. 总量上限校验
    if code_obj.used_count >= code_obj.max_uses:
        raise HTTPException(status_code=400, detail="该兑换码已被领完")
    
    # 4. 单用户重复领取校验
    existing = db.query(models.RedemptionRecord).filter(
        models.RedemptionRecord.user_id == current_user.id,
        models.RedemptionRecord.code_id == code_obj.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="您已经领取过该兑换码")
    
    # 5. 防小号：同指纹限制 (最多3次)
    if current_user.fingerprint:
        fp_count = db.query(models.RedemptionRecord).filter(
            models.RedemptionRecord.code_id == code_obj.id,
            models.RedemptionRecord.fingerprint == current_user.fingerprint
        ).count()
        if fp_count >= 3:
            raise HTTPException(status_code=400, detail="当前设备领用次数已达上限")
            
    # 6. 执行发放逻辑
    code_obj.used_count += 1
    current_user.points += code_obj.points
    
    # 写入领取记录
    record = models.RedemptionRecord(
        user_id=current_user.id,
        code_id=code_obj.id,
        fingerprint=current_user.fingerprint
    )
    db.add(record)
    
    # 写入充值日志以便在账单中显示
    from datetime import datetime
    recharge_log = models.RechargeLog(
        user_id=current_user.id,
        amount=code_obj.points,
        money_amount=0,
        status="success",
        admin_note=f"使用兑换码: {code_obj.code}",
        trade_no=f"REDEEM_{code_obj.id}_{current_user.id}_{int(datetime.now().timestamp())}"
    )
    db.add(recharge_log)
    
    db.commit()
    return {"message": f"兑换成功！已获得 {code_obj.points} 积分", "points_added": code_obj.points}
