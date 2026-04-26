from sqlalchemy.orm import Session
from ..models import models
from ..schemas import user as user_schema
from ..core.utils import generate_unique_uid

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: user_schema.UserCreate, password_hash: str, ip: str = None):
    db_user = models.User(
        username=user.username,
        password_hash=password_hash,
        fingerprint=user.fingerprint,
        last_ip=ip,
        uid=generate_unique_uid(db)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_user_by_email(db: Session, user: user_schema.UserCreateEmail, password_hash: str, ip: str = None):
    # 尝试提取邮箱前缀作为初始用户名
    default_username = user.email.split('@')[0] if user.email else None
    
    db_user = models.User(
        username=default_username,
        email=user.email,
        password_hash=password_hash,
        fingerprint=user.fingerprint,
        last_ip=ip,
        uid=generate_unique_uid(db)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_points(db: Session, user_id: int, points: int):
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db_user.points += points
        db.commit()
        db.refresh(db_user)
    return db_user

def update_user_password(db: Session, user_id: int, new_password_hash: str):
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db_user.password_hash = new_password_hash
        db.commit()
        db.refresh(db_user)
    return db_user
