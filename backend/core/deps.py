from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from . import security
from ..models.database import get_db
from ..crud import user as user_crud

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
oauth2_optional_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="认证失败",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        from .config import get_config
        secret = get_config("SECRET_KEY", security.SECRET_KEY)
        payload = jwt.decode(token, secret, algorithms=[security.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = user_crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

def get_optional_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_optional_scheme)):
    if not token:
        return None
    try:
        from .config import get_config
        secret = get_config("SECRET_KEY", security.SECRET_KEY)
        payload = jwt.decode(token, secret, algorithms=[security.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return user_crud.get_user_by_username(db, username=username)
    except:
        return None
