
import pymysql

# 数据库连接参数
db_config = {
    'host': '127.0.0.1',
    'port': 3307,
    'user': 'gpt_image_relay',
    'password': 'root123',
    'database': 'gpt_image_relay',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def force_update_key():
    qwen_key = "sk-86dc2aa31b9145c0b4dc78adc4eb38b2"
    connection = None
    try:
        connection = pymysql.connect(**db_config)
        with connection.cursor() as cursor:
            # 检查 system_configs 表是否存在，并插入/更新 Key
            sql = """
            INSERT INTO system_configs (config_key, config_value, description) 
            VALUES ('DASHSCOPE_API_KEY', %s, '通义千问智能润色 API Key')
            ON DUPLICATE KEY UPDATE config_value = %s, description = '通义千问智能润色 API Key'
            """
            cursor.execute(sql, (qwen_key, qwen_key))
            connection.commit()
            print("🎉 成功！DASHSCOPE_API_KEY 已直接写入数据库。")
    except Exception as e:
        print(f"❌ 写入失败: {str(e)}")
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    force_update_key()
