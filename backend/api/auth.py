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

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/send-code")
def send_code(data: user_schema.EmailSendCode, db: Session = Depends(get_db)):
    email = data.email
    
    # 校验邮箱是否已注册
    db_user = user_crud.get_user_by_email(db, email=email)
    if db_user:
        raise HTTPException(status_code=400, detail="该邮箱已注册，请直接登录")

    # 限制 60s 内只能发送一次
    last_code = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == email
    ).order_by(models.VerificationCode.created_at.desc()).first()
    
    if last_code and (datetime.utcnow() - last_code.created_at) < timedelta(seconds=60):
        raise HTTPException(status_code=429, detail="发送太频繁，请稍后再试")
        
    code = f"{random.randint(100000, 999999)}"
    
    success = send_verification_email(email, code)
    if success:
        vc = models.VerificationCode(
            email=email,
            code=code,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        db.add(vc)
        db.commit()
        return {"message": "验证码已发送至您的邮箱"}
    else:
        raise HTTPException(status_code=500, detail="邮件发送失败，请检查 SMTP 配置")

@router.post("/register", response_model=user_schema.UserRegisterResponse)
def register(user: user_schema.UserCreateEmail, request: Request, db: Session = Depends(get_db)):
    # 1. 硬性限额校验 (前 100 名)
    user_count = db.query(models.User).count()
    if user_count >= 100:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="内测名额已满 (限额 100 人)"
        )
    
    # 2. 校验邮箱是否已存在
    db_user = user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="此邮箱已注册，请直接登录")
        
    # 2.1 校验用户名是否已存在
    db_user_name = user_crud.get_user_by_username(db, username=user.username)
    if db_user_name:
        raise HTTPException(status_code=400, detail="用户名已被占用，请换一个")
        
    # 3. 校验验证码
    vc = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == user.email,
        models.VerificationCode.code == user.code,
        models.VerificationCode.is_used == False
    ).order_by(models.VerificationCode.created_at.desc()).first()
    
    if not vc or vc.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="验证码无效或已过期")
        
    # 标记已使用
    vc.is_used = True
    db.commit()
    
    # 4. 校验邀请码并确定邀请人
    invited_by_id = None
    inviter = None
    if user.invite_code:
        inviter = db.query(models.User).filter(models.User.uid == user.invite_code).first()
        if inviter:
            invited_by_id = inviter.id

    # 5. 加密密码并创建用户
    hashed_password = security.get_password_hash(user.password)
    client_ip = request.client.host if request.client else "unknown"
    new_user = user_crud.create_user_by_email(db=db, user=user, password_hash=hashed_password, ip=client_ip, invited_by_id=invited_by_id)

    # 6. 如果有邀请人，发放受邀奖励 (5积分)
    if inviter:
        new_user.points += 5
        recharge_crud.create_recharge_log(
            db,
            user_id=new_user.id,
            amount=5,
            status="success",
            admin_note=f"使用邀请码 {user.invite_code} 注册奖励",
            operator_id=0,
            trade_no=f"INVITE_JOIN_{new_user.id}_{int(datetime.now().timestamp())}"
        )
        db.commit()

    # 7. 自动登录：生成 Token
    sub_val = new_user.username if new_user.username else new_user.email
    access_token = security.create_access_token(data={"sub": sub_val})
    
    # 返回包含 Token 的响应 (需要前端配合处理或修改返回模型)
    # 由于 response_model 是 UserInfo，我们需要返回 UserInfo 的字典并带上 token，
    # 或者修改返回模型。为了最简化，我们直接返回一个包含 token 和 user 信息的对象。
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/register-phone", response_model=user_schema.UserRegisterResponse)
def register_phone(user: user_schema.UserCreatePhone, request: Request, db: Session = Depends(get_db)):
    # 1. 硬性限额校验 (前 100 名)
    user_count = db.query(models.User).count()
    if user_count >= 100:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="内测名额已满 (限额 100 人)"
        )
    
    # 2. 校验手机号格式 (11 位数字)
    if not user.phone.isdigit() or len(user.phone) != 11:
        raise HTTPException(status_code=400, detail="请输入正确的 11 位手机号")
    
    # 2.1 校验手机号是否已注册
    db_user = db.query(models.User).filter(models.User.phone == user.phone).first()
    if db_user:
        raise HTTPException(status_code=400, detail="该手机号已注册，请直接登录")
        
    # 3. 如果提供了用户名，校验唯一性
    if user.username:
        db_user_name = user_crud.get_user_by_username(db, username=user.username)
        if db_user_name:
            raise HTTPException(status_code=400, detail="用户名已被占用，请换一个")
    else:
        # 默认用户名：手机号脱敏
        user.username = f"user_{user.phone[-4:]}"
        
    # 4. 校验邀请码并确定邀请人
    invited_by_id = None
    inviter = None
    if user.invite_code:
        inviter = db.query(models.User).filter(models.User.uid == user.invite_code).first()
        if inviter:
            invited_by_id = inviter.id

    # 5. 加密密码并创建用户
    hashed_password = security.get_password_hash(user.password)
    client_ip = request.client.host if request.client else "unknown"
    
    db_user = models.User(
        username=user.username,
        phone=user.phone,
        password_hash=hashed_password,
        fingerprint=user.fingerprint,
        last_ip=client_ip,
        invited_by_id=invited_by_id,
        uid=user_crud.generate_unique_uid(db)
    )
    db.add(db_user)
    db.flush()

    # 6. 如果有邀请人，发放受邀奖励 (5积分)
    if inviter:
        db_user.points += 5
        recharge_crud.create_recharge_log(
            db,
            user_id=db_user.id,
            amount=5,
            status="success",
            admin_note=f"使用邀请码 {user.invite_code} 注册奖励",
            operator_id=0,
            trade_no=f"INVITE_JOIN_PHONE_{db_user.id}_{int(datetime.now().timestamp())}"
        )
        db.commit()

    # 7. 自动登录：生成 Token
    sub_val = db_user.username if db_user.username else db_user.phone
    access_token = security.create_access_token(data={"sub": sub_val})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.post("/login", response_model=user_schema.Token)
def login(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    # 支持用户名、邮箱或手机号三重登录
    db_user = user_crud.get_user_by_email(db, email=user.username) or \
              user_crud.get_user_by_username(db, username=user.username) or \
              db.query(models.User).filter(models.User.phone == user.username).first()
    
    if not db_user or not security.verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名/邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # sub 使用用户名，如果用户名不存在则使用邮箱
    sub_val = db_user.username if db_user.username else db_user.email
    access_token = security.create_access_token(data={"sub": sub_val})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=user_schema.UserInfo)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(
    data: user_schema.UserCreateEmail, # 复用 Schema 获取 email, code, password
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. 基础校验：必须先绑定邮箱才能修改密码
    if not current_user.email:
        raise HTTPException(status_code=400, detail="请先绑定邮箱")
    
    if data.email != current_user.email:
        raise HTTPException(status_code=400, detail="只能使用绑定的邮箱进行验证")

    # 2. 校验验证码
    vc = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == data.email,
        models.VerificationCode.code == data.code,
        models.VerificationCode.is_used == False
    ).order_by(models.VerificationCode.created_at.desc()).first()
    
    if not vc or vc.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="验证码无效或已过期")
    
    # 3. 校验新密码长度
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="新密码长度不能少于 6 位")

    # 4. 标记验证码已使用并更新密码
    vc.is_used = True
    hashed_password = security.get_password_hash(data.password)
    current_user.password_hash = hashed_password
    db.commit()
    
    return {"message": "密码修改成功"}

@router.post("/forgot-password/send-code")
def forgot_password_send_code(data: user_schema.ForgotPasswordSendCode, db: Session = Depends(get_db)):
    email = data.email
    
    # 校验邮箱是否已注册（找回密码要求邮箱必须已注册）
    db_user = user_crud.get_user_by_email(db, email=email)
    if not db_user:
        raise HTTPException(status_code=400, detail="该邮箱未注册")

    # 限制 60s 内只能发送一次
    last_code = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == email
    ).order_by(models.VerificationCode.created_at.desc()).first()
    
    if last_code and (datetime.utcnow() - last_code.created_at) < timedelta(seconds=60):
        raise HTTPException(status_code=429, detail="发送太频繁，请稍后再试")
        
    code = f"{random.randint(100000, 999999)}"
    
    success = send_verification_email(email, code, purpose="reset_password")
    if success:
        vc = models.VerificationCode(
            email=email,
            code=code,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        db.add(vc)
        db.commit()
        return {"message": "验证码已发送至您的邮箱"}
    else:
        raise HTTPException(status_code=500, detail="邮件发送失败，请稍后重试")

@router.post("/forgot-password/reset", response_model=user_schema.UserRegisterResponse)
def forgot_password_reset(data: user_schema.ForgotPasswordReset, db: Session = Depends(get_db)):
    # 1. 校验邮箱是否已注册
    db_user = user_crud.get_user_by_email(db, email=data.email)
    if not db_user:
        raise HTTPException(status_code=400, detail="该邮箱未注册")
    
    # 2. 校验验证码
    vc = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == data.email,
        models.VerificationCode.code == data.code,
        models.VerificationCode.is_used == False
    ).order_by(models.VerificationCode.created_at.desc()).first()
    
    if not vc or vc.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="验证码无效或已过期")
    
    # 3. 标记验证码已使用
    vc.is_used = True
    db.commit()
    
    # 4. 更新密码
    hashed_password = security.get_password_hash(data.new_password)
    user_crud.update_user_password(db, db_user.id, hashed_password)
    
    # 5. 自动登录：生成 Token
    sub_val = db_user.username if db_user.username else db_user.email
    access_token = security.create_access_token(data={"sub": sub_val})
    
    return {
        "message": "密码重置成功，已为您自动登录",
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.post("/bind-email")
def bind_email(
    data: user_schema.UserCreateEmail, # 复用这个 Schema 来获取 email 和 code
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. 校验邮箱是否已被占用
    db_user = user_crud.get_user_by_email(db, email=data.email)
    if db_user:
        raise HTTPException(status_code=400, detail="该邮箱已被其他账号绑定")
    
    # 2. 校验验证码
    vc = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == data.email,
        models.VerificationCode.code == data.code,
        models.VerificationCode.is_used == False
    ).order_by(models.VerificationCode.created_at.desc()).first()
    
    if not vc or vc.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="验证码无效或已过期")
    
    # 3. 标记验证码已使用
    vc.is_used = True
    
    # 4. 绑定邮箱
    current_user.email = data.email
    db.commit()
    
    return {"message": "邮箱绑定成功，您现在可以使用邮箱找回密码了"}

@router.post("/bind-phone")
def bind_phone(
    data: user_schema.UserCreatePhone, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. 校验格式 (11位数字)
    if not data.phone.isdigit() or len(data.phone) != 11:
        raise HTTPException(status_code=400, detail="请输入正确的 11 位手机号")
    
    # 2. 校验手机号是否已被其他账号绑定
    db_user = db.query(models.User).filter(models.User.phone == data.phone).first()
    if db_user:
        raise HTTPException(status_code=400, detail="该手机号已被其他账号占用")
    
    # 3. 绑定
    current_user.phone = data.phone
    db.commit()
    
    return {"message": "手机号绑定成功"}

@router.post("/claim-install-reward")
def claim_install_reward(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 防止未登录或无效用户请求
    if not current_user:
        raise HTTPException(status_code=401, detail="请先登录")
        
    if current_user.has_install_reward:
        raise HTTPException(status_code=400, detail="您已经领取过安装奖励了")
        
    current_user.has_install_reward = True
    current_user.points += 10
    
    # 记录流水
    recharge_crud.create_recharge_log(
        db,
        user_id=current_user.id,
        amount=10,
        status="success",
        admin_note="系统自动发放 PWA 安装奖励",
        operator_id=0,
        trade_no=f"PWA_{current_user.id}_{int(datetime.now().timestamp())}"
    )
    db.commit()
    
    return {"message": "安装奖励领取成功！", "points": current_user.points}

@router.get("/invitation-stats")
def get_invitation_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. 已成功邀请的人数 (受邀者已完成首画)
    invited_count = db.query(models.User).filter(models.User.invited_by_id == current_user.id).count()
    
    # 2. 今日已获得的奖励次数
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
