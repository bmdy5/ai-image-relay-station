from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models import models
from ..crud import user as user_crud, recharge as recharge_crud
from ..schemas import user as user_schema
from ..core.deps import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

# 管理员鉴权中间件
def admin_required(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足，仅管理员可操作"
        )
    return current_user

@router.post("/recharge")
def recharge_points(
    target_username: str, 
    amount: int, 
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    # 1. 查找目标用户
    user = user_crud.get_user_by_username(db, username=target_username)
    if not user:
        raise HTTPException(status_code=404, detail="目标用户不存在")
    
    # 2. 增加积分 (Task 6.1)
    user.points += amount
    
    # 3. 记录充值日志
    recharge_crud.create_recharge_log(
        db, user_id=user.id, amount=amount, operator_id=admin.id
    )
    
    db.commit()
    return {"message": f"成功为 {target_username} 充值 {amount} 积分", "new_balance": user.points}

@router.get("/recharge/pending")
def list_pending_recharges(
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    return recharge_crud.get_pending_recharges(db)

@router.post("/recharge/audit/{log_id}")
def audit_recharge_request(
    log_id: int,
    data: user_schema.RechargeAudit,
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    return recharge_crud.audit_recharge(
        db, 
        log_id=log_id, 
        admin_id=admin.id, 
        approved=data.approved, 
        admin_note=data.admin_note
    )
