from pydantic import BaseModel
from typing import Optional

class ImageCreate(BaseModel):
    prompt: str
    quality: str = "low"  # low, mid, high
    # mode: str = "instant" # 预留
