from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

if not DB_URL:
    print("Error: Missing DATABASE_URL in .env")
    exit(1)

engine = create_engine(DB_URL)

sql_commands = [
    """
    CREATE TABLE IF NOT EXISTS `system_configs` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `config_key` VARCHAR(100) UNIQUE NOT NULL COMMENT '配置项名称',
        `config_value` TEXT COMMENT '配置内容',
        `description` VARCHAR(255) COMMENT '配置描述',
        `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    INSERT IGNORE INTO `system_configs` (`config_key`, `config_value`, `description`) VALUES 
    ('OPENAI_API_KEY', :api_key, 'OpenAI API 密钥'),
    ('OPENAI_BASE_URL', :base_url, 'API 请求基础地址');
    """,
    """
    UPDATE system_configs SET config_value = :api_key WHERE config_key = 'OPENAI_API_KEY';
    """,
    """
    UPDATE system_configs SET config_value = :base_url WHERE config_key = 'OPENAI_BASE_URL';
    """
]

print(f"Connecting to {DB_URL.split('@')[-1]}...")
try:
    with engine.connect() as conn:
        for cmd in sql_commands:
            conn.execute(text(cmd), {"api_key": API_KEY, "base_url": BASE_URL})
        conn.commit()
        print("\n--- [Success] 云端表创建并同步成功！ ---")
        print(f"表 `system_configs` 已建立。")
        print(f"API Key 已同步至云端。")
        print("----------------------------------------\n")
except Exception as e:
    print(f"Error: {e}")
