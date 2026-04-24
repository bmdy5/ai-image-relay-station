from sqlalchemy.orm import Session
from ..models import models
from ..schemas import user as user_schema

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: user_schema.UserCreate, password_hash: str, ip: str = None):
    db_user = models.User(
        username=user.username,
        password_hash=password_hash,
        fingerprint=user.fingerprint,
        last_ip=ip
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_points(db: Session, user_id: int, points: int):
    db_user = get_user_id(db, user_id)
    if db_user:
        db_user.points += points
        db.commit()
        db.refresh(db_user)
    return db_user
