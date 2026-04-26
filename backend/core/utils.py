import random
import string

PRICING = {
    "standard": 5,
    "hd": 15,
    "master": 30
}

# 排除易混淆字符：I, O, L, 0, 1
CHARSET = "23456789ABCDEFGHJKMNPQRSTWXYZ"

def generate_uid(length=6):
    """生成指定长度的易读随机 UID"""
    return ''.join(random.choices(CHARSET, k=length))

def generate_unique_uid(db, length=6):
    """生成唯一的 UID，确保数据库中不存在"""
    from ..models import models
    while True:
        uid = generate_uid(length)
        exists = db.query(models.User).filter(models.User.uid == uid).first()
        if not exists:
            return uid
