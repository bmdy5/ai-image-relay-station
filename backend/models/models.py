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
    amount = Column(Integer)
    operator_id = Column(Integer)  # 操作管理员的 ID
    created_at = Column(DateTime, default=datetime.utcnow)

    target_user = relationship("User", back_populates="recharge_logs")
