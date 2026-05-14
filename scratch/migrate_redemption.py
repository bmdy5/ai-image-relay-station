# scratch/migrate_redemption.py
import sys
import os
# 将项目根目录添加到系统路径，以便可以导入 backend 模块
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.models.database import engine, Base
from backend.models.models import RedemptionCode, RedemptionRecord

def migrate():
    print("开始创建表...")
    Base.metadata.create_all(bind=engine)
    print("表创建成功！")

if __name__ == "__main__":
    migrate()
