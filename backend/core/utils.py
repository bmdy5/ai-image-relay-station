import random
import string
from datetime import datetime, timedelta, timezone

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

def get_beijing_time():
    """获取当前的北京时间 (Naive Datetime)"""
    # 强制获取 UTC+8 时间并去掉时区信息，确保与 SQLAlchemy 默认的 naive DateTime 兼容
    return datetime.now(timezone(timedelta(hours=8))).replace(tzinfo=None)

def safe_compare_time(t1, t2):
    """安全地对比两个时间对象，自动处理 naive/aware 差异"""
    if t1 is None or t2 is None:
        return False
    # 统一转换为 naive (去掉时区信息) 进行对比
    t1_naive = t1.replace(tzinfo=None) if t1.tzinfo else t1
    t2_naive = t2.replace(tzinfo=None) if t2.tzinfo else t2
    return t1_naive, t2_naive
