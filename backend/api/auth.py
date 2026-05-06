from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import random
from datetime import datetime, timedelta

from ..models.database import get_db
from ..models import models
from ..schemas import user as user_schema
from ..crud import user as user_crud
from ..crud import recharge as recharge_crud
from ..core import security
from ..core.deps import get_current_user
from ..core.email import send_verification_email
from ..core.config import get_config
from ..services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/send-code")
def send_code(data: user_schema.EmailSendCode, db: Session = Depends(get_db)):
    email = data.email
    db_user = user_crud.get_user_by_email(db, email=email)
    if db_user:
        raise HTTPException(status_code=400, detail="该邮箱已注册，请直接登录")

    last_code = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == email
    ).order_by(models.VerificationCode.created_at.desc()).first()
    
    if last_code and (datetime.utcnow() - last_code.created_at) < timedelta(seconds=60):
        raise HTTPException(status_code=429, detail="发送太频繁，请稍后再试")
        
    code = f"{random.randint(100000, 999999)}"
    success = send_verification_email(email, code)
    if success:
        vc = models.VerificationCode(
            email=email, code=code,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        db.add(vc)
        db.commit()
        return {"message": "验证码已发送至您的邮箱"}
    else:
        raise HTTPException(status_code=500, detail="邮件发送失败，请检查 SMTP 配置")

@router.post("/register", response_model=user_schema.UserRegisterResponse)
def register(user: user_schema.UserCreateEmail, request: Request, db: Session = Depends(get_db)):
    if not AuthService.verify_verification_code(db, user.email, user.code):
        raise HTTPException(status_code=400, detail="验证码无效或已过期")
    client_ip = request.client.host if request.client else "unknown"
    return AuthService.register_user_by_email(db, user, client_ip)

@router.post("/register-phone", response_model=user_schema.UserRegisterResponse)
def register_phone(user: user_schema.UserCreatePhone, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    return AuthService.register_user_by_phone(db, user, client_ip)

@router.post("/login", response_model=user_schema.Token)
def login(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = user_crud.get_user_by_email(db, email=user.username) or \
              user_crud.get_user_by_username(db, username=user.username) or \
              db.query(models.User).filter(models.User.phone == user.username).first()
    
    if not db_user or not security.verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名/邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    sub_val = db_user.username if db_user.username else db_user.email
    access_token = security.create_access_token(data={"sub": sub_val})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=user_schema.UserInfo)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(data: user_schema.UserCreateEmail, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AuthService.change_password(db, current_user, data)

@router.post("/forgot-password/send-code")
def forgot_password_send_code(data: user_schema.ForgotPasswordSendCode, db: Session = Depends(get_db)):
    email = data.email
    db_user = user_crud.get_user_by_email(db, email=email)
    if not db_user:
        raise HTTPException(status_code=400, detail="该邮箱未注册")

    last_code = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == email
    ).order_by(models.VerificationCode.created_at.desc()).first()
    
    if last_code and (datetime.utcnow() - last_code.created_at) < timedelta(seconds=60):
        raise HTTPException(status_code=429, detail="发送太频繁，请稍后再试")
        
    code = f"{random.randint(100000, 999999)}"
    success = send_verification_email(email, code, purpose="reset_password")
    if success:
        vc = models.VerificationCode(
            email=email, code=code,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        db.add(vc)
        db.commit()
        return {"message": "验证码已发送至您的邮箱"}
    else:
        raise HTTPException(status_code=500, detail="邮件发送失败，请稍后重试")

@router.post("/forgot-password/reset", response_model=user_schema.UserRegisterResponse)
def forgot_password_reset(data: user_schema.ForgotPasswordReset, db: Session = Depends(get_db)):
    return AuthService.reset_password(db, data)

@router.post("/bind-email")
def bind_email(data: user_schema.UserCreateEmail, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AuthService.bind_email(db, current_user, data)

@router.post("/bind-phone")
def bind_phone(data: user_schema.UserCreatePhone, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AuthService.bind_phone(db, current_user, data.phone)

@router.post("/claim-install-reward")
def claim_install_reward(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AuthService.claim_install_reward(db, current_user)

@router.get("/invitation-stats")
def get_invitation_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    invited_count = db.query(models.User).filter(models.User.invited_by_id == current_user.id).count()
    from datetime import datetime, time, timedelta
    now = datetime.utcnow() + timedelta(hours=8)
    today_start = datetime.combine(now.date(), time.min) - timedelta(hours=8)
    
    today_reward_count = db.query(models.RechargeLog).filter(
        models.RechargeLog.user_id == current_user.id,
        models.RechargeLog.trade_no.like("INVITE_REWARD_%"),
        models.RechargeLog.created_at >= today_start
    ).count()
    
    return {
        "invited_count": invited_count,
        "today_reward_count": today_reward_count,
        "daily_limit": 5,
        "invite_code": current_user.uid,
        "invite_url": f"{get_config('FRONTEND_URL', 'http://localhost:3000')}/register?invite={current_user.uid}"
    }
