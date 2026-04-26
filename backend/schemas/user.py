from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    fingerprint: Optional[str] = None

class UserCreate(UserBase):
    password: str

class EmailSendCode(BaseModel):
    email: str

class UserCreateEmail(BaseModel):
    email: str
    password: str
    code: str
    fingerprint: Optional[str] = None

class UserInfo(UserBase):
    id: int
    uid: Optional[str] = None
    points: int
    frozen_points: int = 0
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class ForgotPasswordSendCode(BaseModel):
    email: str

class ForgotPasswordReset(BaseModel):
    email: str
    code: str
    new_password: str

class RechargeApply(BaseModel):
    money_amount: int
    screenshot_url: Optional[str] = None

class RechargeAudit(BaseModel):
    approved: bool
    admin_note: Optional[str] = None
