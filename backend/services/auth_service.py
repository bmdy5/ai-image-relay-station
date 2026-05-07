from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models import models
from ..crud import user as user_crud
from ..crud import recharge as recharge_crud
from ..core import security
from ..core.config import get_config
from ..core.utils import get_beijing_time

class AuthService:
    @staticmethod
    def verify_verification_code(db: Session, email: str, code: str) -> bool:
        """校验验证码有效性并标记已使用"""
        vc = db.query(models.VerificationCode).filter(
            models.VerificationCode.email == email,
            models.VerificationCode.code == code,
            models.VerificationCode.is_used == False
        ).order_by(models.VerificationCode.created_at.desc()).first()
        
        # 使用统一的北京时间进行过期校验
        now = get_beijing_time()
        if not vc:
            return False
            
        # 兼容数据库中可能存在的有时区/无时区格式
        expiry_time = vc.expires_at.replace(tzinfo=None) if vc.expires_at.tzinfo else vc.expires_at
        if expiry_time < now:
            return False
            
        vc.is_used = True
        db.commit()
        return True

    @staticmethod
    def register_user_by_email(db: Session, user_data, client_ip: str):
        """处理邮箱注册逻辑：限额、邀请、奖励、自动登录"""
        user_count = db.query(models.User).count()
        if user_count >= 100:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="内测名额已满 (限额 100 人)"
            )
        
        if user_crud.get_user_by_email(db, email=user_data.email):
            raise HTTPException(status_code=400, detail="此邮箱已注册，请直接登录")
        if user_crud.get_user_by_username(db, username=user_data.username):
            raise HTTPException(status_code=400, detail="用户名已被占用，请换一个")
            
        invited_by_id = None
        inviter = None
        if user_data.invite_code:
            inviter = db.query(models.User).filter(models.User.uid == user_data.invite_code).first()
            if inviter:
                invited_by_id = inviter.id

        hashed_password = security.get_password_hash(user_data.password)
        new_user = user_crud.create_user_by_email(
            db=db, user=user_data, password_hash=hashed_password, 
            ip=client_ip, invited_by_id=invited_by_id
        )

        if inviter:
            new_user.points += 5
            recharge_crud.create_recharge_log(
                db,
                user_id=new_user.id,
                amount=5,
                status="success",
                admin_note=f"使用邀请码 {user_data.invite_code} 注册奖励",
                operator_id=0,
                trade_no=f"INVITE_JOIN_{new_user.id}_{int(get_beijing_time().timestamp())}"
            )
            db.commit()

        sub_val = new_user.username if new_user.username else new_user.email
        access_token = security.create_access_token(data={"sub": sub_val})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": new_user
        }

    @staticmethod
    def register_user_by_phone(db: Session, user_data, client_ip: str):
        """处理手机号注册逻辑"""
        user_count = db.query(models.User).count()
        if user_count >= 100:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="内测名额已满")
        
        if not user_data.phone.isdigit() or len(user_data.phone) != 11:
            raise HTTPException(status_code=400, detail="请输入正确的手机号")
        if db.query(models.User).filter(models.User.phone == user_data.phone).first():
            raise HTTPException(status_code=400, detail="该手机号已注册")
            
        if user_data.username:
            if user_crud.get_user_by_username(db, username=user_data.username):
                raise HTTPException(status_code=400, detail="用户名已被占用")
        else:
            user_data.username = f"user_{user_data.phone[-4:]}"
            
        invited_by_id = None
        inviter = None
        if user_data.invite_code:
            inviter = db.query(models.User).filter(models.User.uid == user_data.invite_code).first()
            if inviter:
                invited_by_id = inviter.id

        hashed_password = security.get_password_hash(user_data.password)
        db_user = models.User(
            username=user_data.username,
            phone=user_data.phone,
            password_hash=hashed_password,
            fingerprint=user_data.fingerprint,
            last_ip=client_ip,
            invited_by_id=invited_by_id,
            uid=user_crud.generate_unique_uid(db)
        )
        db.add(db_user)
        db.flush()

        if inviter:
            db_user.points += 5
            recharge_crud.create_recharge_log(
                db,
                user_id=db_user.id,
                amount=5,
                status="success",
                admin_note=f"使用邀请码 {user_data.invite_code} 注册奖励",
                operator_id=0,
                trade_no=f"INVITE_JOIN_PHONE_{db_user.id}_{int(get_beijing_time().timestamp())}"
            )

        db.commit()
        db.refresh(db_user)

        sub_val = db_user.username if db_user.username else db_user.phone
        access_token = security.create_access_token(data={"sub": sub_val})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": db_user
        }

    @staticmethod
    def change_password(db: Session, current_user, data):
        """修改密码业务逻辑"""
        if not current_user.email:
            raise HTTPException(status_code=400, detail="请先绑定邮箱")
        if data.email != current_user.email:
            raise HTTPException(status_code=400, detail="只能使用绑定的邮箱进行验证")

        if not AuthService.verify_verification_code(db, data.email, data.code):
            raise HTTPException(status_code=400, detail="验证码无效或已过期")
        
        if len(data.password) < 6:
            raise HTTPException(status_code=400, detail="新密码长度不能少于 6 位")

        current_user.password_hash = security.get_password_hash(data.password)
        db.commit()
        return {"message": "密码修改成功"}

    @staticmethod
    def reset_password(db: Session, data):
        """找回密码重置逻辑"""
        db_user = user_crud.get_user_by_email(db, email=data.email)
        if not db_user:
            raise HTTPException(status_code=400, detail="该邮箱未注册")
        
        if not AuthService.verify_verification_code(db, data.email, data.code):
            raise HTTPException(status_code=400, detail="验证码无效或已过期")
        
        hashed_password = security.get_password_hash(data.new_password)
        user_crud.update_user_password(db, db_user.id, hashed_password)
        
        sub_val = db_user.username if db_user.username else db_user.email
        access_token = security.create_access_token(data={"sub": sub_val})
        
        return {
            "message": "密码重置成功，已为您自动登录",
            "access_token": access_token,
            "token_type": "bearer",
            "user": db_user
        }

    @staticmethod
    def bind_email(db: Session, current_user, data):
        """绑定邮箱逻辑"""
        if user_crud.get_user_by_email(db, email=data.email):
            raise HTTPException(status_code=400, detail="该邮箱已被其他账号绑定")
        
        if not AuthService.verify_verification_code(db, data.email, data.code):
            raise HTTPException(status_code=400, detail="验证码无效或已过期")
        
        current_user.email = data.email
        db.commit()
        return {"message": "邮箱绑定成功"}

    @staticmethod
    def bind_phone(db: Session, current_user, phone: str):
        """绑定手机号逻辑"""
        if not phone.isdigit() or len(phone) != 11:
            raise HTTPException(status_code=400, detail="请输入正确的 11 位手机号")
        if db.query(models.User).filter(models.User.phone == phone).first():
            raise HTTPException(status_code=400, detail="该手机号已被其他账号占用")
        
        current_user.phone = phone
        db.commit()
        return {"message": "手机号绑定成功"}

    @staticmethod
    def claim_install_reward(db: Session, current_user):
        """发放安装奖励逻辑"""
        if current_user.has_install_reward:
            raise HTTPException(status_code=400, detail="您已经领取过安装奖励了")
            
        current_user.has_install_reward = True
        current_user.points += 10
        
        recharge_crud.create_recharge_log(
            db,
            user_id=current_user.id,
            amount=10,
            status="success",
            admin_note="系统自动发放 PWA 安装奖励",
            operator_id=0,
            trade_no=f"PWA_{current_user.id}_{int(get_beijing_time().timestamp())}"
        )
        db.commit()
        return {"message": "安装奖励领取成功！", "points": current_user.points}
