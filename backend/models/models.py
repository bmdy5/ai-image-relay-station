from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
from ..core.utils import get_beijing_time

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    password_hash = Column(String(255))
    fingerprint = Column(String)
    points = Column(Integer, default=10)
    frozen_points = Column(Integer, default=0)
    uid = Column(String(20), unique=True, index=True)
    last_ip = Column(String)
    is_admin = Column(Boolean, default=False)
    has_used_experience = Column(Boolean, default=False)
    has_install_reward = Column(Boolean, default=False)
    invited_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=get_beijing_time)

    image_logs = relationship("ImageLog", back_populates="owner")
    recharge_logs = relationship("RechargeLog", back_populates="target_user")

class ImageLog(Base):
    __tablename__ = "image_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prompt = Column(Text)
    quality = Column(String)
    style = Column(String, default="default")
    final_prompt = Column(Text)
    cost_points = Column(Integer)
    points_snapshot = Column(Integer, default=0)
    image_url = Column(String)
    ref_image_url = Column(Text)
    parent_id = Column(Integer, index=True, nullable=True)
    root_id = Column(Integer, index=True, nullable=True)
    iteration = Column(Integer, default=0)
    status = Column(String)
    error_msg = Column(Text)
    created_at = Column(DateTime, index=True, default=get_beijing_time)
    
    queue_duration = Column(Integer, default=0)
    api_duration = Column(Integer, default=0)
    generation_duration = Column(Integer, default=0)
    storage_duration = Column(Integer, default=0)
    total_duration = Column(Integer, default=0)
    share_count = Column(Integer, default=0)

    owner = relationship("User", back_populates="image_logs")

class RechargeLog(Base):
    __tablename__ = "recharge_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    money_amount = Column(Integer)
    screenshot_url = Column(String)
    status = Column(String, default="pending")
    admin_note = Column(String)
    operator_id = Column(Integer)
    out_trade_no = Column(String(64), unique=True, index=True, nullable=True)
    trade_no = Column(String(64), unique=True, index=True, nullable=True)
    payment_method = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=get_beijing_time)

    target_user = relationship("User", back_populates="recharge_logs")

class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String(100), unique=True, index=True)
    config_value = Column(Text)
    description = Column(String(255))
    updated_at = Column(DateTime, default=get_beijing_time, onupdate=get_beijing_time)

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    contact = Column(String(100))
    status = Column(String, default="pending")
    admin_note = Column(Text)
    created_at = Column(DateTime, default=get_beijing_time)

    user = relationship("User")

class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True)
    code = Column(String(10))
    expires_at = Column(DateTime)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_beijing_time)
