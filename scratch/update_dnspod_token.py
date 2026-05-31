import os
import sys

# 确保 backend 模块可以被正确导入
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.models.database import session_scope
from backend.models.models import SystemConfig

def update_dnspod_token():
    token_id = "628393"
    token_val = "73792b3b3b1a13aebb10f19ff8931a733"
    
    with session_scope() as session:
        # 更新或创建 DNSPOD_TOKEN_ID
        config_id = session.query(SystemConfig).filter(SystemConfig.config_key == "DNSPOD_TOKEN_ID").first()
        if config_id:
            config_id.config_value = token_id
            print("成功在数据库中更新 DNSPOD_TOKEN_ID。")
        else:
            config_id = SystemConfig(
                config_key="DNSPOD_TOKEN_ID",
                config_value=token_id,
                description="腾讯云 DNSPod Token ID (备份)"
            )
            session.add(config_id)
            print("成功在数据库中插入 DNSPOD_TOKEN_ID。")
            
        # 更新或创建 DNSPOD_TOKEN
        config_token = session.query(SystemConfig).filter(SystemConfig.config_key == "DNSPOD_TOKEN").first()
        if config_token:
            config_token.config_value = token_val
            print("成功在数据库中更新 DNSPOD_TOKEN。")
        else:
            config_token = SystemConfig(
                config_key="DNSPOD_TOKEN",
                config_value=token_val,
                description="腾讯云 DNSPod Token Key (备份)"
            )
            session.add(config_token)
            print("成功在数据库中插入 DNSPOD_TOKEN。")

if __name__ == "__main__":
    try:
        update_dnspod_token()
        print("DNSPod Token 数据库备份成功！")
    except Exception as e:
        print(f"备份数据库失败: {e}", file=sys.stderr)
