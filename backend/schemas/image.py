from pydantic import BaseModel
from typing import Optional

class ImageCreate(BaseModel):
    prompt: str
    quality: str = "standard"  # standard, hd, master
    style: str = "default"     # 新增：风格 ID

class ImageLogInfo(BaseModel):
    id: int
    prompt: str
    quality: str
    cost_points: int
    image_url: Optional[str] = None
    status: str
    created_at: __import__('datetime').datetime

    class Config:
        from_attributes = True
    # mode: str = "instant" # 预留
