import os
import sys

# 确保 backend 模块可以被正确导入
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.models.database import session_scope
from backend.models.models import SystemConfig

def update_keys():
    secret_id = os.getenv("TENCENT_CLOUD_SECRET_ID", "请在此处替换为你的SecretID")
    secret_key = os.getenv("TENCENT_CLOUD_SECRET_KEY", "请在此处替换为你的SecretKey")

    
    with session_scope() as session:
        # 更新或创建 TENCENT_CLOUD_SECRET_ID
        config_id = session.query(SystemConfig).filter(SystemConfig.config_key == "TENCENT_CLOUD_SECRET_ID").first()
        if config_id:
            config_id.config_value = secret_id
            print("成功在数据库中更新 TENCENT_CLOUD_SECRET_ID。")
        else:
            config_id = SystemConfig(
                config_key="TENCENT_CLOUD_SECRET_ID",
                config_value=secret_id,
                description="腾讯云 COS 密钥 ID"
            )
            session.add(config_id)
            print("成功在数据库中插入 TENCENT_CLOUD_SECRET_ID。")
            
        # 更新或创建 TENCENT_CLOUD_SECRET_KEY
        config_key = session.query(SystemConfig).filter(SystemConfig.config_key == "TENCENT_CLOUD_SECRET_KEY").first()
        if config_key:
            config_key.config_value = secret_key
            print("成功在数据库中更新 TENCENT_CLOUD_SECRET_KEY。")
        else:
            config_key = SystemConfig(
                config_key="TENCENT_CLOUD_SECRET_KEY",
                config_value=secret_key,
                description="腾讯云 COS 密钥 Key"
            )
            session.add(config_key)
            print("成功在数据库中插入 TENCENT_CLOUD_SECRET_KEY。")

if __name__ == "__main__":
    try:
        update_keys()
        print("数据库配置更新完成！")
    except Exception as e:
        print(f"更新数据库失败: {e}", file=sys.stderr)
