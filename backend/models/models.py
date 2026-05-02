from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    password_hash = Column(String(255))
    fingerprint = Column(String)
    points = Column(Integer, default=10)  # 默认赠送 10 积分
    frozen_points = Column(Integer, default=0)  # 冻结积分
    uid = Column(String(20), unique=True, index=True)
    last_ip = Column(String)
    is_admin = Column(Boolean, default=False)
    has_used_experience = Column(Boolean, default=False) # 新增：是否已使用过 1 元体验
    created_at = Column(DateTime, default=lambda: datetime.now(__import__('datetime').timezone(__import__('datetime').timedelta(hours=8))))

    # 关联
    image_logs = relationship("ImageLog", back_populates="owner")
    recharge_logs = relationship("RechargeLog", back_populates="target_user")

class ImageLog(Base):
    __tablename__ = "image_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prompt = Column(Text)
    quality = Column(String)  # standard / hd / master
    style = Column(String, default="default")  # 风格标注
    final_prompt = Column(Text)  # 最终包装后的提示词
    cost_points = Column(Integer)
    image_url = Column(String)
    ref_image_url = Column(String) # 新增：记录参考图
    status = Column(String)  # success / failed
    error_msg = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(__import__('datetime').timezone(__import__('datetime').timedelta(hours=8))))
    
    # Performance tracking (Task: Timing Analysis)
    queue_duration = Column(Integer, default=0)       # 队列排队时间 (ms)
    api_duration = Column(Integer, default=0)         # 中转站 API 响应时间 (ms)
    generation_duration = Column(Integer, default=0)  # AI 生成总时间 (含 API 和本地处理) (ms)
    storage_duration = Column(Integer, default=0)     # 转存 COS 时间 (ms)
    total_duration = Column(Integer, default=0)       # 总任务耗时 (ms)

    owner = relationship("User", back_populates="image_logs")

class RechargeLog(Base):
    __tablename__ = "recharge_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)  # 对应积分
    money_amount = Column(Integer)  # 实际金额 (元)
    screenshot_url = Column(String)  # 截图 URL
    status = Column(String, default="pending")  # pending / success / rejected
    admin_note = Column(String)  # 管理员理由
    operator_id = Column(Integer)  # 操作管理员的 ID
    out_trade_no = Column(String(64), unique=True, index=True, nullable=True)  # 商户订单号
    trade_no = Column(String(64), unique=True, index=True, nullable=True)  # 支付平台交易号
    payment_method = Column(String(20), nullable=True)  # 支付方式 (wxpay/alipay)
    created_at = Column(DateTime, default=lambda: datetime.now(__import__('datetime').timezone(__import__('datetime').timedelta(hours=8))))

    target_user = relationship("User", back_populates="recharge_logs")

class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String(100), unique=True, index=True)
    config_value = Column(Text)
    description = Column(String(255))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    contact = Column(String(100))
    status = Column(String, default="pending")
    admin_note = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(__import__('datetime').timezone(__import__('datetime').timedelta(hours=8))))

    user = relationship("User")

class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True)
    code = Column(String(10))
    expires_at = Column(DateTime)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(__import__('datetime').timezone(__import__('datetime').timedelta(hours=8))))
