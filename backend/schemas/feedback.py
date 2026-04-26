from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FeedbackCreate(BaseModel):
    content: str
    contact: Optional[str] = None

class FeedbackUpdate(BaseModel):
    status: Optional[str] = None
    admin_note: Optional[str] = None

class FeedbackRead(BaseModel):
    id: int
    user_id: Optional[int]
    content: str
    contact: Optional[str]
    status: str
    admin_note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
