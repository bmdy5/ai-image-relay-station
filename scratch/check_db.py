from backend.models.database import SessionLocal
from backend.models import models

db = SessionLocal()
try:
    logs = db.query(models.ImageLog).all()
    print(f"Total logs in DB: {len(logs)}")
    for log in logs:
        print(f"ID: {log.id}, Status: {log.status}, URL: {log.image_url}")
finally:
    db.close()
