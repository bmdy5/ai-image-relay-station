from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# 显式加载 .env（仅限本地开发）
load_dotenv()

from backend.api import auth, image, admin, user, feedback, payment
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from fastapi import Request
from fastapi.responses import JSONResponse

app = FastAPI()

import traceback

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    print(f"--- DATABASE ERROR (SQLAlchemyError) ---")
    traceback.print_exc()
    return JSONResponse(
        status_code=503,
        content={"detail": "SYSTEM_MAINTENANCE", "message": "系统服务暂时不可用"},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    exc_str = str(exc).lower()
    if any(k in exc_str for k in ["mysql", "operationalerror", "connection refused", "sqlalchemy"]):
        print(f"--- DATABASE ERROR (Global Catch) ---")
        traceback.print_exc()
        return JSONResponse(
            status_code=503,
            content={"detail": "SYSTEM_MAINTENANCE", "message": "系统核心服务连接异常"},
        )
    
    print(f"--- UNEXPECTED ERROR ---")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "SERVER_ERROR", "message": "服务器内部错误"},
    )

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://119.29.232.114",
        "https://visionary.ai"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(image.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(payment.router, prefix="/api")

from sqlalchemy import text
from backend.models.database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session

@app.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    # 尝试执行一个最简单的查询来验证数据库连接
    db.execute(text("SELECT 1"))
    return {"status": "ok", "message": "GPT-Image2 Relay Station API and Database are healthy"}
