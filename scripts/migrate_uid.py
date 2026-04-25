import sys
import os

# 将项目根目录加入 python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.database import SessionLocal
from backend.models import models
from backend.core.utils import generate_unique_uid

def migrate():
    db = SessionLocal()
    try:
        users_without_uid = db.query(models.User).filter(models.User.uid == None).all()
        print(f"Found {len(users_without_uid)} users without UID.")
        
        for user in users_without_uid:
            new_uid = generate_unique_uid(db)
            user.uid = new_uid
            print(f"Assigned UID {new_uid} to user {user.username}")
        
        db.commit()
        print("Migration completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Migration failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
