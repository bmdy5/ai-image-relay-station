from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

def sync_smtp_to_db():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: Missing DATABASE_URL in .env")
        return

    # 需要同步的 key
    keys_to_sync = ["SMTP_SERVER", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"]
    
    engine = create_engine(db_url)
    
    with engine.connect() as conn:
        for key in keys_to_sync:
            value = os.getenv(key)
            if value:
                print(f"Syncing {key} to database...")
                # 使用 MySQL 的 ON DUPLICATE KEY UPDATE 语法
                sql = text("""
                    INSERT INTO system_configs (config_key, config_value) 
                    VALUES (:key, :value)
                    ON DUPLICATE KEY UPDATE config_value = :value
                """)
                conn.execute(sql, {"key": key, "value": str(value)})
        conn.commit()
    print("\n✅ SMTP 配置同步完成！")

if __name__ == "__main__":
    sync_smtp_to_db()
