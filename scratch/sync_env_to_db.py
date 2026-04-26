from sqlalchemy import create_engine, text
import os
import sys

# 尝试从 .env 读取
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DB_URL = os.getenv("DATABASE_URL")
API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL")

if not DB_URL:
    print("Error: Missing DATABASE_URL in .env")
    sys.exit(1)

print(f"Connecting to database to sync keys...")
try:
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        # 更新 API_KEY
        if os.getenv("OPENAI_API_KEY"):
            conn.execute(
                text("INSERT INTO system_configs (config_key, config_value) VALUES ('OPENAI_API_KEY', :val) ON DUPLICATE KEY UPDATE config_value = :val"),
                {"val": os.getenv("OPENAI_API_KEY")}
            )
        # 更新 BASE_URL
        if os.getenv("OPENAI_BASE_URL"):
            conn.execute(
                text("INSERT INTO system_configs (config_key, config_value) VALUES ('OPENAI_BASE_URL', :val) ON DUPLICATE KEY UPDATE config_value = :val"),
                {"val": os.getenv("OPENAI_BASE_URL")}
            )
        # 更新 支付乐相关配置
        payle_configs = {
            "PAYLE_PID": os.getenv("PAYLE_PID"),
            "PAYLE_KEY": os.getenv("PAYLE_KEY"),
            "PAYLE_API_URL": os.getenv("PAYLE_API_URL"),
            "PAYLE_NOTIFY_URL": os.getenv("PAYLE_NOTIFY_URL"),
            "PAYLE_RETURN_URL": os.getenv("PAYLE_RETURN_URL")
        }
        for key, val in payle_configs.items():
            if val:
                conn.execute(
                    text("INSERT INTO system_configs (config_key, config_value) VALUES (:key, :val) ON DUPLICATE KEY UPDATE config_value = :val"),
                    {"key": key, "val": val}
                )
        
        conn.commit()
        print("\n--- [Success] 配置同步成功！ ---")
        print("已更新: OpenAI API Key, Base URL 以及 支付乐相关参数")
        print("---------------------------\n")
except Exception as e:
    print(f"Error syncing to DB: {e}")
