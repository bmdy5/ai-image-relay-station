from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# 显式加载 .env（仅限本地开发）
load_dotenv()

from backend.api import auth, image, admin, user, feedback, payment

app = FastAPI()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.get("/api/auth/debug")
def debug_env():
    # 诊断接口：检查环境变量是否到位
    db_url = os.getenv("DATABASE_URL", "NOT_FOUND")
    secret = os.getenv("SECRET_KEY", "NOT_FOUND")
    
    # 脱敏处理
    masked_url = db_url
    if "@" in db_url:
        parts = db_url.split("@")
        masked_url = "mysql+pymysql://****:****@" + parts[1]
        
    return {
        "DATABASE_URL_FOUND": db_url != "NOT_FOUND",
        "DATABASE_URL_MASKED": masked_url,
        "SECRET_KEY_FOUND": secret != "NOT_FOUND",
        "ENV_LIST": list(os.environ.keys())[:10] # 只列出前10个Key确认连通性
    }

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "GPT-Image2 Relay Station API is running"}

# 这里的 app 对象将被 Vercel 识别为 Serverless 处理函数
