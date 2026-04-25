from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import auth, image, admin, user

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

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "GPT-Image2 Relay Station API is running"}

# 这里的 app 对象将被 Vercel 识别为 Serverless 处理函数
