from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    fingerprint = Column(String)
    points = Column(Integer, default=10)  # 默认赠送 10 积分
    frozen_points = Column(Integer, default=0)  # 冻结积分
    uid = Column(String(20), unique=True, index=True)
    last_ip = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关联
    image_logs = relationship("ImageLog", back_populates="owner")
    recharge_logs = relationship("RechargeLog", back_populates="target_user")

class ImageLog(Base):
    __tablename__ = "image_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prompt = Column(Text)
    quality = Column(String)  # low / mid / high
    cost_points = Column(Integer)
    image_url = Column(String)
    status = Column(String)  # success / failed
    error_msg = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

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
    created_at = Column(DateTime, default=datetime.utcnow)

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
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
