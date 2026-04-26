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

if not DB_URL or not API_KEY:
    print("Error: Missing DATABASE_URL or OPENAI_API_KEY in .env")
    sys.exit(1)

print(f"Connecting to database to sync keys...")
try:
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        # 更新 API_KEY
        conn.execute(
            text("UPDATE system_configs SET config_value = :val WHERE config_key = 'OPENAI_API_KEY'"),
            {"val": API_KEY}
        )
        # 更新 BASE_URL
        conn.execute(
            text("UPDATE system_configs SET config_value = :val WHERE config_key = 'OPENAI_BASE_URL'"),
            {"val": BASE_URL}
        )
        conn.commit()
        print("\n--- [Success] 同步成功！ ---")
        print(f"API_KEY 已更新 (脱敏显示: {API_KEY[:6]}...{API_KEY[-4:]})")
        print(f"BASE_URL 已更新: {BASE_URL}")
        print("---------------------------\n")
except Exception as e:
    print(f"Error syncing to DB: {e}")
