from backend.models.database import session_scope
from backend.models import models
import os
import time

# 内存缓存，避免频繁查库
_config_cache = {}
_cache_ttl = 60  # 缓存有效期 60 秒
_last_fetch = 0

def get_config(key: str, default=None):
    """
    获取系统配置：
    1. 优先从内存缓存获取
    2. 如果缓存过期，从数据库获取并更新缓存
    3. 如果数据库中没有该配置或值为空，则降级从环境变量获取
    """
    global _last_fetch, _config_cache
    
    now = time.time()
    # 检查缓存是否过期
    if now - _last_fetch > _cache_ttl:
        try:
            with session_scope() as db:
                configs = db.query(models.SystemConfig).all()
                _config_cache = {c.config_key: c.config_value for c in configs}
                _last_fetch = now
        except Exception as e:
            print(f"--- [Config Error] 无法从数据库读取配置: {e} ---")
            # 数据库故障时，直接回退到环境变量
            return os.getenv(key, default)
            
    # 1. 尝试从数据库缓存获取
    val = _config_cache.get(key)
    if val is not None and val.strip() != "":
        return val
        
    # 2. 数据库没配置或为空，回退到环境变量
    env_val = os.getenv(key)
    if env_val is not None:
        return env_val
        
    return default
