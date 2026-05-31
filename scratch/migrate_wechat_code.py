# scratch/migrate_wechat_code.py
import sys
import os
from sqlalchemy import text

# 将项目根目录添加到系统路径，以便可以导入 backend 模块
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.database import engine, Base
from backend.models.models import WechatLoginCode

def migrate():
    print("1. 开始创建 wechat_login_codes 表...")
    try:
        Base.metadata.create_all(bind=engine)
        print("wechat_login_codes 表创建/检查成功！")
    except Exception as e:
        print(f"创建 wechat_login_codes 表失败: {e}")
        sys.exit(1)

    print("\n所有微信验证码迁移操作完成！")

if __name__ == "__main__":
    migrate()
