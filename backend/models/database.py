from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# 从环境变量读取 MySQL 配置
# 格式: mysql+pymysql://user:password@host:port/dbname
MYSQL_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost:3306/gpt_image_relay")

engine = create_engine(
    MYSQL_URL,
    pool_size=20,        # 扩大连接池
    max_overflow=10,     # 允许溢出连接
    pool_recycle=3600,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

from contextlib import contextmanager

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
