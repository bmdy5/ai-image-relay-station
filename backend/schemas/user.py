from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    fingerprint: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInfo(UserBase):
    id: int
    uid: Optional[str] = None
    points: int
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

class RechargeApply(BaseModel):
    money_amount: int
    screenshot_url: Optional[str] = None

class RechargeAudit(BaseModel):
    approved: bool
    admin_note: Optional[str] = None
