
import os
import sys

# 将项目根目录加入路径
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.models.database import session_scope
from backend.models import models
from sqlalchemy.sql import text

def update_config(key, value, desc):
    with session_scope() as db:
        config = db.query(models.SystemConfig).filter(models.SystemConfig.config_key == key).first()
        if config:
            config.config_value = value
            config.description = desc
            print(f"已更新配置: {key}")
        else:
            new_config = models.SystemConfig(config_key=key, config_value=value, description=desc)
            db.add(new_config)
            print(f"已创建新配置: {key}")
        db.commit()

if __name__ == "__main__":
    qwen_key = "sk-86dc2aa31b9145c0b4dc78adc4eb38b2"
    update_config("DASHSCOPE_API_KEY", qwen_key, "通义千问智能润色 API Key")
    print("数据库配置更新完成。")
