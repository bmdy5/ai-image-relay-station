from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import text
import random
import time
import logging
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
from ..core.utils import get_beijing_time
from ..services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# 登录失败计数: {(ip, username): [attempt_count, lock_until_timestamp]}
_login_failures = {}
_LOGIN_MAX_ATTEMPTS = 5
_LOGIN_LOCK_SECONDS = 900  # 15 分钟
_LOGIN_FAILURE_TTL = 3600  # 未达阈值的记录 1 小时后自动清理


def _cleanup_expired_failures():
    """清理过期和已解锁的失败记录，防止内存泄漏"""
    now = time.time()
    expired = [
        k for k, (count, lock_until) in _login_failures.items()
        if (lock_until and now >= lock_until) or (not lock_until and now - _LOGIN_FAILURE_TTL > 0)
    ]
    for k in expired:
        del _login_failures[k]


def _send_code_with_lock(db: Session, email: str, purpose: str = "register") -> dict:
    """
    使用 MySQL GET_LOCK 实现数据库级分布式锁，防止并发重复发送验证码。
    流程：获取锁(非阻塞) -> 检查60s冷却 -> 先写库 -> 再发邮件
    """
    expiry_minutes = 10 if purpose == "login" else 5
    lock_name = f"send_code:{purpose}:{email}"

    # 1. 尝试获取 MySQL 分布式锁（超时=0，非阻塞：拿不到立即失败）
    result = db.execute(text("SELECT GET_LOCK(:lock_name, 0)"), {"lock_name": lock_name})
    got_lock = result.scalar()

    if not got_lock:
        raise HTTPException(status_code=429, detail="发送过于频繁，请稍后再试")

    try:
        # 2. 清除 SQLAlchemy 缓存，确保从数据库读取最新数据
        db.expire_all()

        # 3. 在锁内检查 60s 冷却期（消除竞态条件）
        last_code = db.query(models.VerificationCode).filter(
            models.VerificationCode.email == email
        ).order_by(models.VerificationCode.created_at.desc()).first()

        now = get_beijing_time()
        if last_code:
            last_time = last_code.created_at.replace(tzinfo=None) if last_code.created_at.tzinfo else last_code.created_at
            if (now - last_time) < timedelta(seconds=60):
                raise HTTPException(status_code=429, detail="发送太频繁，请稍后再试")

        # 4. 生成验证码并先写入数据库（占位），防止其他请求通过冷却检查
        code = f"{random.randint(100000, 999999)}"
        vc = models.VerificationCode(
            email=email, code=code,
            expires_at=now + timedelta(minutes=expiry_minutes)
        )
        db.add(vc)
        db.commit()

        # 5. 发送邮件（已在锁内完成写库，即使发送失败也不会有并发问题）
        success = send_verification_email(email, code, purpose=purpose)
        if not success:
            # 邮件发送失败，删除刚写入的验证码记录
            db.delete(vc)
            db.commit()
            raise HTTPException(status_code=500, detail="邮件发送失败，请稍后重试")

        return {"message": "验证码已发送至您的邮箱"}

    finally:
        # 6. 无论成功失败，都释放锁
        db.execute(text("SELECT RELEASE_LOCK(:lock_name)"), {"lock_name": lock_name})
        logger.debug(f"Released lock: {lock_name}")

@router.post("/send-code")
def send_code(data: user_schema.EmailSendCode, db: Session = Depends(get_db)):
    email = data.email
    db_user = user_crud.get_user_by_email(db, email=email)
    if db_user:
        raise HTTPException(status_code=400, detail="该邮箱已注册，请直接登录")

    return _send_code_with_lock(db, email, purpose="register")

@router.post("/send-login-code")
def send_login_code(data: user_schema.EmailSendCode, db: Session = Depends(get_db)):
    """发送登录验证码（需邮箱已注册）"""
    email = data.email
    db_user = user_crud.get_user_by_email(db, email=email)
    if not db_user:
        raise HTTPException(status_code=400, detail="该邮箱未注册，请先注册")
    return _send_code_with_lock(db, email, purpose="login")

@router.post("/login-by-code", response_model=user_schema.Token)
def login_by_code(data: user_schema.LoginByCode, db: Session = Depends(get_db)):
    """验证码登录：验证通过后返回 JWT token"""
    if not AuthService.verify_verification_code(db, data.email, data.code):
        raise HTTPException(status_code=400, detail="验证码错误或已过期")
    db_user = user_crud.get_user_by_email(db, email=data.email)
    if not db_user:
        raise HTTPException(status_code=400, detail="该邮箱未注册")
    sub_val = db_user.username if db_user.username else db_user.email
    access_token = security.create_access_token(data={"sub": sub_val})
    return {"access_token": access_token, "token_type": "bearer"}

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
def login(user: user_schema.UserCreate, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    login_key = (client_ip, user.username)

    _cleanup_expired_failures()

    # 检查是否被锁定
    if login_key in _login_failures:
        count, lock_until = _login_failures[login_key]
        if lock_until and time.time() < lock_until:
            remaining = int(lock_until - time.time())
            raise HTTPException(
                status_code=429,
                detail=f"登录尝试过于频繁，请 {remaining} 秒后重试"
            )
        # 锁已过期，清除记录
        if lock_until and time.time() >= lock_until:
            del _login_failures[login_key]

    db_user = user_crud.get_user_by_email(db, email=user.username) or \
              user_crud.get_user_by_username(db, username=user.username) or \
              db.query(models.User).filter(models.User.phone == user.username).first()

    if not db_user or not security.verify_password(user.password, db_user.password_hash):
        # 记录失败
        count, _ = _login_failures.get(login_key, (0, None))
        count += 1
        if count >= _LOGIN_MAX_ATTEMPTS:
            _login_failures[login_key] = (count, time.time() + _LOGIN_LOCK_SECONDS)
        else:
            _login_failures[login_key] = (count, None)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名/邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 登录成功，清除失败记录
    _login_failures.pop(login_key, None)

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

    return _send_code_with_lock(db, email, purpose="reset_password")

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

@router.post("/daily-reward")
def daily_reward(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return AuthService.claim_daily_reward(db, current_user)

@router.get("/invitation-stats")
def get_invitation_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    invited_count = db.query(models.User).filter(models.User.invited_by_id == current_user.id).count()
    from datetime import time
    now = get_beijing_time()
    today_start = datetime.combine(now.date(), time.min)
    
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


# ==========================================
# 微信公众号扫码登录端点
# ==========================================
import hashlib
import uuid
import xml.etree.ElementTree as ET
from fastapi import Response
from ..services.wechat_service import WechatService

def check_signature(signature: str, timestamp: str, nonce: str) -> bool:
    token = get_config("WECHAT_TOKEN")
    if not token:
        logger.warning("未配置 WECHAT_TOKEN，微信回调签名校验将失败")
        return False
    tmp_list = sorted([token, timestamp, nonce])
    tmp_str = "".join(tmp_list)
    sha1 = hashlib.sha1()
    sha1.update(tmp_str.encode("utf-8"))
    return sha1.hexdigest() == signature

@router.get("/wechat/qrcode")
async def get_wechat_qrcode(db: Session = Depends(get_db)):
    """获取微信扫码临时二维码"""
    scene_str = str(uuid.uuid4())
    try:
        qrcode_url = await WechatService.create_temporary_qrcode(scene_str, expire_seconds=300)
    except Exception as e:
        logger.error(f"获取微信二维码失败: {e}")
        raise HTTPException(status_code=500, detail="生成微信二维码失败，请稍后重试")
    
    now = get_beijing_time()
    session = models.WechatLoginSession(
        scene_str=scene_str,
        status="pending",
        expires_at=now + timedelta(seconds=300)
    )
    db.add(session)
    db.commit()
    
    return {
        "qrcode_url": qrcode_url,
        "scene_str": scene_str,
        "expires_in": 300
    }

@router.get("/wechat/check-status")
async def check_wechat_status(scene_str: str, db: Session = Depends(get_db)):
    """轮询检查微信扫码状态"""
    session = db.query(models.WechatLoginSession).filter(
        models.WechatLoginSession.scene_str == scene_str
    ).first()
    
    if not session:
        return {"status": "expired"}
        
    now = get_beijing_time()
    # 兼容时区
    expiry = session.expires_at.replace(tzinfo=None) if session.expires_at.tzinfo else session.expires_at
    if expiry < now and session.status == "pending":
        session.status = "expired"
        db.commit()
        return {"status": "expired"}
        
    if session.status == "success":
        return {
            "status": "success",
            "token": session.token
        }
        
    if session.status == "failed":
        return {
            "status": "failed",
            "detail": "该微信已被其他账号绑定"
        }
        
    return {"status": "pending"}

@router.get("/wechat/bind-qrcode")
async def get_wechat_bind_qrcode(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """已登录用户获取绑定微信的临时二维码"""
    uuid_hex = uuid.uuid4().hex
    scene_str = f"bind:{current_user.id}:{uuid_hex}"
    
    try:
        qrcode_url = await WechatService.create_temporary_qrcode(scene_str, expire_seconds=300)
    except Exception as e:
        logger.error(f"获取微信绑定二维码失败: {e}")
        raise HTTPException(status_code=500, detail="生成微信绑定二维码失败，请稍后重试")
        
    now = get_beijing_time()
    session = models.WechatLoginSession(
        scene_str=scene_str,
        status="pending",
        expires_at=now + timedelta(seconds=300)
    )
    db.add(session)
    db.commit()
    
    return {
        "qrcode_url": qrcode_url,
        "scene_str": scene_str,
        "expires_in": 300
    }

@router.post("/wechat/unbind")
def unbind_wechat(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """解绑微信"""
    if not current_user.wechat_openid:
        raise HTTPException(status_code=400, detail="当前账户未绑定微信")
        
    # 安全校验：确保有其他登录通道
    if not (current_user.email or current_user.phone):
        raise HTTPException(status_code=400, detail="为了您的账户安全，解绑微信前必须先绑定邮箱或手机号")
    if not current_user.password_hash:
        raise HTTPException(status_code=400, detail="为了您的账户安全，请先在安全设置中设置登录密码，以防遗忘微信后无法登入")
        
    current_user.wechat_openid = None
    db.commit()
    return {"message": "微信解绑成功"}

from pydantic import BaseModel

class WechatPasscodeLogin(BaseModel):
    code: str

@router.post("/wechat/login-by-passcode")
async def wechat_login_by_passcode(
    data: WechatPasscodeLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """微信验证码登录：通过公众号后台获取的 6 位数字验证码登录"""
    code = data.code.strip()
    if not code:
        raise HTTPException(status_code=400, detail="请输入验证码")
        
    # 查询待核销的验证码记录
    wechat_code = db.query(models.WechatLoginCode).filter(
        models.WechatLoginCode.code == code,
        models.WechatLoginCode.status == "pending"
    ).first()
    
    if not wechat_code:
        raise HTTPException(status_code=400, detail="验证码无效或已过期")
        
    # 检查是否过期
    now = get_beijing_time()
    expiry = wechat_code.expires_at.replace(tzinfo=None) if wechat_code.expires_at.tzinfo else wechat_code.expires_at
    if expiry < now:
        wechat_code.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="验证码已过期，请在公众号重新获取")
        
    from_user = wechat_code.wechat_openid
    
    # 查找或静默注册用户
    user = db.query(models.User).filter(models.User.wechat_openid == from_user).first()
    if not user:
        user_count = db.query(models.User).count()
        if user_count >= 100:
            raise HTTPException(status_code=400, detail="非常抱歉！目前 Visionary 内测名额已满")
            
        suffix = uuid.uuid4().hex[:6]
        username = f"wx_{suffix}"
        while db.query(models.User).filter(models.User.username == username).first():
            suffix = uuid.uuid4().hex[:6]
            username = f"wx_{suffix}"
            
        from ..crud.user import generate_unique_uid
        user = models.User(
            username=username,
            wechat_openid=from_user,
            password_hash="",
            points=10,
            uid=generate_unique_uid(db),
            last_ip=request.client.host if request.client else "unknown"
        )
        db.add(user)
        db.flush()
        
        recharge_crud.create_recharge_log(
            db,
            user_id=user.id,
            amount=10,
            status="success",
            admin_note="微信扫码关注注册奖励",
            operator_id=0,
            trade_no=f"WECHAT_JOIN_{user.id}_{int(get_beijing_time().timestamp())}"
        )
        db.commit()
        
    # 生成访问 Token
    sub_val = user.username if user.username else user.email
    access_token = security.create_access_token(data={"sub": sub_val})
    
    # 更新验证码状态为已核销
    wechat_code.status = "used"
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/wechat/callback")
async def wechat_callback_get(
    signature: str,
    timestamp: str,
    nonce: str,
    echostr: str
):
    """微信回调验证 (GET)"""
    if check_signature(signature, timestamp, nonce):
        return Response(content=echostr, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Signature verification failed")

@router.post("/wechat/callback")
async def wechat_callback_post(
    request: Request,
    signature: str,
    timestamp: str,
    nonce: str,
    db: Session = Depends(get_db)
):
    """微信推送事件接收与登录处理 (POST)"""
    if not check_signature(signature, timestamp, nonce):
        raise HTTPException(status_code=403, detail="Signature verification failed")

    body = await request.body()
    body_str = body.decode("utf-8")
    
    try:
        root = ET.fromstring(body_str)
        msg_type = root.find("MsgType").text
        to_user = root.find("ToUserName").text
        from_user = root.find("FromUserName").text  # 用户 OpenID
        
        # 1. 处理用户回复的文本消息（例如获取 6 位数字验证码登录）
        if msg_type == "text":
            content = root.find("Content").text.strip() if root.find("Content") is not None else ""
            if content in ["登录", "验证码", "1"]:
                # 生成 6 位随机验证码
                code = f"{random.randint(100000, 999999)}"
                # 确保唯一性
                while db.query(models.WechatLoginCode).filter(
                    models.WechatLoginCode.code == code,
                    models.WechatLoginCode.status == "pending"
                ).first():
                    code = f"{random.randint(100000, 999999)}"
                
                # 写入数据库，有效期 5 分钟
                now = get_beijing_time()
                expires_at = now + timedelta(minutes=5)
                wechat_code = models.WechatLoginCode(
                    code=code,
                    wechat_openid=from_user,
                    status="pending",
                    expires_at=expires_at
                )
                db.add(wechat_code)
                db.commit()
                
                reply_xml = f"""
                <xml>
                  <ToUserName><![CDATA[{from_user}]]></ToUserName>
                  <FromUserName><![CDATA[{to_user}]]></FromUserName>
                  <CreateTime>{int(time.time())}</CreateTime>
                  <MsgType><![CDATA[text]]></MsgType>
                  <Content><![CDATA[您的登录验证码是：【{code}】。请在网页端微信登录窗口中输入，5分钟内有效。感谢您的支持！]]></Content>
                </xml>
                """
                return Response(content=reply_xml, media_type="application/xml")

        # 2. 处理关注或扫码等事件消息
        if msg_type == "event":
            event = root.find("Event").text
            event_key = root.find("EventKey").text if root.find("EventKey") is not None else ""
            
            if event in ["subscribe", "SCAN"]:
                scene_str = event_key
                if event == "subscribe" and scene_str.startswith("qrscene_"):
                    scene_str = scene_str[len("qrscene_"):]
                
                # 针对未认证公众号的普通扫码/关注流（无 scene_str 场景参数）
                if event == "subscribe" and not scene_str:
                    reply_xml = f"""
                    <xml>
                      <ToUserName><![CDATA[{from_user}]]></ToUserName>
                      <FromUserName><![CDATA[{to_user}]]></FromUserName>
                      <CreateTime>{int(time.time())}</CreateTime>
                      <MsgType><![CDATA[text]]></MsgType>
                      <Content><![CDATA[🎉 欢迎关注 小肖不嚣张！
                      
如需登录 Visionary 绘图宇宙，请在后台发送：【 登录 】或【 1 】获取6位数字验证码。]]></Content>
                    </xml>
                    """
                    return Response(content=reply_xml, media_type="application/xml")
                
                # 原有的动态场景值扫码登录逻辑（兼容服务号）
                if scene_str:
                    # 查找 pending 状态的会话
                    session = db.query(models.WechatLoginSession).filter(
                        models.WechatLoginSession.scene_str == scene_str,
                        models.WechatLoginSession.status == "pending"
                    ).first()
                    
                    if session:
                        if scene_str.startswith("bind:"):
                            # 处理微信账号绑定流程
                            parts = scene_str.split(":")
                            if len(parts) >= 2:
                                user_id_str = parts[1]
                                try:
                                    user_id = int(user_id_str)
                                except ValueError:
                                    user_id = None
                                
                                if user_id:
                                    # 检查该微信是否已被其他账号绑定
                                    existing_user = db.query(models.User).filter(models.User.wechat_openid == from_user).first()
                                    if existing_user:
                                        session.status = "failed"
                                        db.commit()
                                        
                                        reply_xml = f"""
                                        <xml>
                                          <ToUserName><![CDATA[{from_user}]]></ToUserName>
                                          <FromUserName><![CDATA[{to_user}]]></FromUserName>
                                          <CreateTime>{int(time.time())}</CreateTime>
                                          <MsgType><![CDATA[text]]></MsgType>
                                          <Content><![CDATA[❌ 绑定失败！该微信已被其他账号绑定，无法重复关联。]]></Content>
                                        </xml>
                                        """
                                        return Response(content=reply_xml, media_type="application/xml")
                                    
                                    # 未被占用，开始绑定到该账号上
                                    user = db.query(models.User).filter(models.User.id == user_id).first()
                                    if user:
                                        user.wechat_openid = from_user
                                        session.status = "success"
                                        db.commit()
                                        
                                        reply_xml = f"""
                                        <xml>
                                          <ToUserName><![CDATA[{from_user}]]></ToUserName>
                                          <FromUserName><![CDATA[{to_user}]]></FromUserName>
                                          <CreateTime>{int(time.time())}</CreateTime>
                                          <MsgType><![CDATA[text]]></MsgType>
                                          <Content><![CDATA[🎉 绑定成功！您的账户已成功关联此微信，后续可使用微信扫码一键登录。]]></Content>
                                        </xml>
                                        """
                                        return Response(content=reply_xml, media_type="application/xml")
                        else:
                            # 正常微信扫码登录流程
                            user = db.query(models.User).filter(models.User.wechat_openid == from_user).first()
                            if not user:
                                # 静默注册
                                user_count = db.query(models.User).count()
                                if user_count >= 100:
                                    reply_xml = f"""
                                    <xml>
                                      <ToUserName><![CDATA[{from_user}]]></ToUserName>
                                      <FromUserName><![CDATA[{to_user}]]></FromUserName>
                                      <CreateTime>{int(time.time())}</CreateTime>
                                      <MsgType><![CDATA[text]]></MsgType>
                                      <Content><![CDATA[非常抱歉！目前 Visionary 内测名额已满 (限额 100 人)。感谢您的支持！]]></Content>
                                    </xml>
                                    """
                                    return Response(content=reply_xml, media_type="application/xml")
                                
                                suffix = uuid.uuid4().hex[:6]
                                username = f"wx_{suffix}"
                                while db.query(models.User).filter(models.User.username == username).first():
                                    suffix = uuid.uuid4().hex[:6]
                                    username = f"wx_{suffix}"
                                
                                from ..crud.user import generate_unique_uid
                                user = models.User(
                                    username=username,
                                    wechat_openid=from_user,
                                    password_hash="",
                                    points=10,
                                    uid=generate_unique_uid(db),
                                    last_ip=request.client.host if request.client else "unknown"
                                )
                                db.add(user)
                                db.flush()
                                
                                recharge_crud.create_recharge_log(
                                    db,
                                    user_id=user.id,
                                    amount=10,
                                    status="success",
                                    admin_note="微信扫码关注注册奖励",
                                    operator_id=0,
                                    trade_no=f"WECHAT_JOIN_{user.id}_{int(get_beijing_time().timestamp())}"
                                )
                                db.commit()
                            
                            # 生成访问 Token
                            sub_val = user.username if user.username else user.email
                            access_token = security.create_access_token(data={"sub": sub_val})
                            
                            # 更新 Session 状态
                            session.status = "success"
                            session.token = access_token
                            session.wechat_openid = from_user
                            db.commit()
                            
                            # 回复微信友好消息
                            reply_xml = f"""
                            <xml>
                              <ToUserName><![CDATA[{from_user}]]></ToUserName>
                              <FromUserName><![CDATA[{to_user}]]></FromUserName>
                              <CreateTime>{int(time.time())}</CreateTime>
                              <MsgType><![CDATA[text]]></MsgType>
                              <Content><![CDATA[🎉 登录成功！欢迎进入 Visionary 绘图宇宙。网页端已自动为您跳转，开启您的创意之旅吧！]]></Content>
                            </xml>
                            """
                            return Response(content=reply_xml, media_type="application/xml")
                        
    except Exception as e:
        logger.error(f"处理微信回调异常: {e}")
        
    return Response(content="success", media_type="text/plain")

