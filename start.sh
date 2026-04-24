#!/bin/bash

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}正在清理旧进程...${NC}"
# 杀死 8000 端口 (后端)
PID_BACKEND=$(lsof -t -i:8000)
if [ ! -z "$PID_BACKEND" ]; then
    kill -9 $PID_BACKEND
    echo "已关闭旧的后端进程 (PID: $PID_BACKEND)"
fi

# 杀死 5173 端口 (前端)
PID_FRONTEND=$(lsof -t -i:5173)
if [ ! -z "$PID_FRONTEND" ]; then
    kill -9 $PID_FRONTEND
    echo "已关闭旧的前端进程 (PID: $PID_FRONTEND)"
fi

echo -e "${GREEN}正在启动后端服务 (FastAPI)...${NC}"
export PYTHONPATH=$PYTHONPATH:.
python3 -m uvicorn api.index:app --host 127.0.0.1 --port 8000 > backend.log 2>&1 &

echo -e "${GREEN}正在启动前端服务 (Vite)...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &

echo -e "${YELLOW}------------------------------------------${NC}"
echo -e "${GREEN}一键启动成功！${NC}"
echo -e "后端运行在: ${YELLOW}http://127.0.0.1:8000${NC}"
echo -e "前端运行在: ${YELLOW}http://localhost:5173${NC}"
echo -e "查看日志: tail -f backend.log 或 tail -f frontend.log"
echo -e "${YELLOW}------------------------------------------${NC}"
