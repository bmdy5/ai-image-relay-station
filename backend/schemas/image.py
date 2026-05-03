from pydantic import BaseModel
from typing import Optional

class ImageCreate(BaseModel):
    prompt: str
    quality: str = "standard"  # standard, hd, master
    style: str = "default"     # 新增：风格 ID
    aspect_ratio: Optional[str] = "1:1"  # 新增：比例 (1:1, 9:16, 16:9)
    ref_image_url: Optional[str] = None  # 新增：参考图 URL (图生图)
    parent_id: Optional[int] = None      # 新增：迭代父 ID
    root_id: Optional[int] = None        # 新增：迭代根 ID
    iteration: Optional[int] = 0         # 新增：当前迭代次数

class ImageLogInfo(BaseModel):
    id: int
    prompt: str
    quality: str
    cost_points: int
    image_url: Optional[str] = None
    status: str
    share_count: Optional[int] = 0
    created_at: __import__('datetime').datetime

    class Config:
        from_attributes = True
    # mode: str = "instant" # 预留
