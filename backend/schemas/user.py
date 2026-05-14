from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    fingerprint: Optional[str] = None

class UserCreate(UserBase):
    password: str

class EmailSendCode(BaseModel):
    email: str

class UserCreateEmail(BaseModel):
    username: str
    email: str
    password: str
    code: str
    fingerprint: Optional[str] = None
    invite_code: Optional[str] = None

class UserCreatePhone(BaseModel):
    username: Optional[str] = None
    phone: str
    password: str
    captcha_code: str
    fingerprint: Optional[str] = None
    invite_code: Optional[str] = None

class UserInfo(UserBase):
    id: int
    uid: Optional[str] = None
    points: int
    frozen_points: int = 0
    is_admin: bool
    has_used_experience: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class UserRegisterResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserInfo

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

class LoginByCode(BaseModel):
    email: str
    code: str

class RechargeApply(BaseModel):
    money_amount: float
    screenshot_url: Optional[str] = None

class RechargeAudit(BaseModel):
    approved: bool
    admin_note: Optional[str] = None

class RechargeLogInfo(BaseModel):
    id: int
    amount: int
    money_amount: Optional[float]
    status: str
    payment_method: Optional[str]
    trade_no: Optional[str] = None
    admin_note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RedemptionRequest(BaseModel):
    code: str

class RedemptionCodeCreate(BaseModel):
    code: str
    points: int = 50
    max_uses: int = 100
    is_active: bool = True
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class RedemptionCodeInfo(RedemptionCodeCreate):
    id: int
    used_count: int
    created_at: datetime
    class Config:
        from_attributes = True
