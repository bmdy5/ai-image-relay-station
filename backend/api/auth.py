from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models import models
from ..schemas import user as user_schema
from ..crud import user as user_crud
from ..core import security
from ..core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=user_schema.UserInfo)
def register(user: user_schema.UserCreate, request: Request, db: Session = Depends(get_db)):
    # 1. 硬性限额校验 (前 100 名)
    user_count = db.query(models.User).count()
    if user_count >= 100:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="内测名额已满 (限额 100 人)"
        )
    
    # 2. 校验用户名是否已存在
    db_user = user_crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="用户名已被注册")
    
    # 3. 加密密码并创建用户
    hashed_password = security.get_password_hash(user.password)
    client_ip = request.client.host if request.client else "unknown"
    return user_crud.create_user(db=db, user=user, password_hash=hashed_password, ip=client_ip)

@router.post("/login", response_model=user_schema.Token)
def login(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = user_crud.get_user_by_username(db, username=user.username)
    if not db_user or not security.verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=user_schema.UserInfo)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(
    data: user_schema.PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. 验证旧密码
    if not security.verify_password(data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="旧密码错误"
        )
    
    # 2. 更新新密码
    hashed_password = security.get_password_hash(data.new_password)
    user_crud.update_user_password(db, current_user.id, hashed_password)
    
    return {"message": "密码修改成功"}
