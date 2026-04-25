from sqlalchemy import create_engine, text
import os

engine = create_engine("mysql+pymysql://gpt_image_relay:root123@119.29.232.114:3306/gpt_image_relay")
with engine.connect() as conn:
    res = conn.execute(text("SELECT error_msg FROM image_logs WHERE status='failed' ORDER BY created_at DESC LIMIT 1")).fetchone()
    if res:
        print(res[0])
    else:
        print("No failed logs found")
