from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.database import get_db
from ..models import models
from ..crud import user as user_crud, recharge as recharge_crud
from ..schemas import user as user_schema
from ..core.deps import get_current_user
from ..core.cos import delete_from_cos

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
        db, user_id=user.id, amount=amount, operator_id=admin.id, admin_note="管理员手动充值"
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

@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    """获取管理后台仪表盘综合统计数据 (Task 3.1)"""
    # 1. 基础统计
    total_users = db.query(models.User).count()
    total_images = db.query(models.ImageLog).filter(models.ImageLog.status == "success").count()
    
    # 2. 财务统计 (充值流水)
    total_revenue = db.query(func.sum(models.RechargeLog.money_amount)).filter(models.RechargeLog.status == "success").scalar() or 0
    
    # 3. 积分消耗统计
    total_points_spent = db.query(func.sum(models.ImageLog.cost_points)).filter(models.ImageLog.status == "success").scalar() or 0
    
    # 4. 风格排行统计 (Task 3.2)
    style_stats = db.query(
        models.ImageLog.style, 
        func.count(models.ImageLog.id)
    ).filter(models.ImageLog.status == "success").group_by(models.ImageLog.style).order_by(func.count(models.ImageLog.id).desc()).all()
    
    # 5. 最近全站动态 (实时流)
    recent_logs = db.query(models.ImageLog).order_by(models.ImageLog.created_at.desc()).limit(20).all()
    
    return {
        "summary": {
            "total_users": total_users,
            "total_images": total_images,
            "total_revenue": total_revenue,
            "total_points_spent": total_points_spent
        },
        "styles": [{"id": s[0], "count": s[1]} for s in style_stats],
        "recent_logs": [
            {
                "id": l.id,
                "user_id": l.user_id,
                "prompt": l.prompt,
                "status": l.status,
                "image_url": l.image_url,
                "created_at": l.created_at,
                "style": l.style
            } for l in recent_logs
        ]
    }

@router.delete("/image/{log_id}/wipe")
def wipe_image_record(
    log_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    """违规内容彻底抹除 (Task 3.3)"""
    log = db.query(models.ImageLog).filter(models.ImageLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    # 1. 删除 COS 文件
    if log.image_url:
        try:
            delete_from_cos(log.image_url)
        except:
            pass # 即使删除文件失败也继续删除记录
            
    # 2. 删除数据库记录
    db.delete(log)
    db.commit()
    return {"message": "已彻底抹除记录及图片文件"}

@router.get("/invitation/logs")
def list_invitation_logs(
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    """邀请奖励审计日志 (Task 6.1)"""
    # 获取所有邀请相关的充值日志
    logs = db.query(models.RechargeLog, models.User).join(
        models.User, models.RechargeLog.user_id == models.User.id
    ).filter(
        models.RechargeLog.trade_no.like("INVITE_%")
    ).order_by(models.RechargeLog.created_at.desc()).limit(100).all()
    
    return [
        {
            "id": l[0].id,
            "user_id": l[0].user_id,
            "username": l[1].username,
            "amount": l[0].amount,
            "trade_no": l[0].trade_no,
            "admin_note": l[0].admin_note,
            "created_at": l[0].created_at,
            "ip": l[1].last_ip,
            "fingerprint": l[1].fingerprint
        } for l in logs
    ]

import json
from ..core.config import get_config

@router.post("/announcement")
def save_announcement(
    data: dict,
    db: Session = Depends(get_db),
    admin: models.User = Depends(admin_required)
):
    """管理员保存系统公告"""
    raw = json.dumps(data, ensure_ascii=False)
    existing = db.query(models.SystemConfig).filter(
        models.SystemConfig.config_key == "ANNOUNCEMENT"
    ).first()
    if existing:
        existing.config_value = raw
    else:
        db.add(models.SystemConfig(config_key="ANNOUNCEMENT", config_value=raw, description="系统公告"))
    db.commit()
    # 清除 config 缓存让修改立即生效
    from ..core import config as config_module
    config_module._last_fetch = 0
    return {"message": "公告已更新"}
