# scratch/seed_redemption.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.models.database import session_scope
from backend.models import models

def seed():
    with session_scope() as db:
        # 检查是否已存在
        existing = db.query(models.RedemptionCode).filter(models.RedemptionCode.code == 'WELCOME50').first()
        if not existing:
            code = models.RedemptionCode(
                code='WELCOME50',
                points=50,
                max_uses=100,
                is_active=True
            )
            db.add(code)
            print("已成功创建初始兑换码: WELCOME50")
        else:
            print("兑换码 WELCOME50 已存在")

if __name__ == "__main__":
    seed()
