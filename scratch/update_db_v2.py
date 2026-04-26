import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

# 从 DATABASE_URL 解析
db_url = os.getenv("DATABASE_URL")
# mysql+pymysql://user:password@host:port/dbname
import re
match = re.match(r"mysql\+pymysql://(.+):(.+)@(.+):(\d+)/(.+)", db_url)
user, password, host, port, dbname = match.groups()

connection = pymysql.connect(
    host=host,
    user=user,
    password=password,
    database=dbname,
    port=int(port)
)

try:
    with connection.cursor() as cursor:
        # 添加字段
        sql_commands = [
            "ALTER TABLE recharge_logs ADD COLUMN out_trade_no VARCHAR(64) UNIQUE;",
            "ALTER TABLE recharge_logs ADD COLUMN trade_no VARCHAR(64) UNIQUE;",
            "ALTER TABLE recharge_logs ADD COLUMN payment_method VARCHAR(20);"
        ]
        for sql in sql_commands:
            try:
                cursor.execute(sql)
                print(f"Executed: {sql}")
            except Exception as e:
                print(f"Error executing {sql}: {e}")
    connection.commit()
finally:
    connection.close()
