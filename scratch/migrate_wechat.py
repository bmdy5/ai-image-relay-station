# scratch/migrate_wechat.py
import sys
import os
from sqlalchemy import text

# 将项目根目录添加到系统路径，以便可以导入 backend 模块
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.database import engine, Base
from backend.models.models import WechatLoginSession

def migrate():
    print("1. 开始创建 wechat_login_sessions 表...")
    Base.metadata.create_all(bind=engine)
    print("wechat_login_sessions 表创建成功！")

    print("\n2. 开始为 users 表添加 wechat_openid 和 wechat_unionid 字段...")
    with engine.begin() as conn:
        # 添加 wechat_openid
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN wechat_openid VARCHAR(100) NULL UNIQUE"))
            print("成功添加字段: wechat_openid")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("字段 wechat_openid 已存在，跳过。")
            else:
                print(f"添加 wechat_openid 失败: {e}")

        # 添加 wechat_unionid
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN wechat_unionid VARCHAR(100) NULL UNIQUE"))
            print("成功添加字段: wechat_unionid")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("字段 wechat_unionid 已存在，跳过。")
            else:
                print(f"添加 wechat_unionid 失败: {e}")

    print("\n所有微信迁移操作完成！")

if __name__ == "__main__":
    migrate()
