#!/bin/bash

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}正在清理服务器旧进程...${NC}"
# 杀死 8000 端口 (后端)
PID_BACKEND=$(lsof -t -i:8000)
if [ ! -z "$PID_BACKEND" ]; then
    kill -9 $PID_BACKEND
    echo "已关闭旧的后端进程 (PID: $PID_BACKEND)"
fi

# 杀死 5173 端口 (前端开发服务器)
PID_FRONTEND=$(lsof -t -i:5173)
if [ ! -z "$PID_FRONTEND" ]; then
    kill -9 $PID_FRONTEND
    echo "已关闭旧的前端开发进程 (PID: $PID_FRONTEND)"
fi

# 服务器环境：强制指定数据库连接到 3306 端口
export DATABASE_URL="mysql+pymysql://gpt_image_relay:root123@127.0.0.1:3306/gpt_image_relay"

echo -e "${GREEN}正在启动后端服务 (FastAPI) [生产模式]...${NC}"
export PYTHONPATH=$PYTHONPATH:.
# 在服务器上监听 0.0.0.0 以便外部访问
python3 -m uvicorn api.index:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &

echo -e "${YELLOW}是否需要重新编译前端? (y/n)${NC}"
read -t 5 -n 1 -p "默认 5 秒后跳过: " SHOULD_BUILD
echo ""

if [[ "$SHOULD_BUILD" == "y" ]]; then
    echo -e "${GREEN}正在编译前端 (Production Build)...${NC}"
    cd frontend
    npm run build
    cd ..
    echo -e "${GREEN}编译完成！静态文件已生成至 frontend/dist${NC}"
fi

echo -e "${GREEN}正在启动前端预览服务 (Vite Preview)...${NC}"
cd frontend
# 如果你使用 Nginx 指向了 dist 目录，则不需要运行此行
# 但为了确保你立刻能看到效果，我们启动预览模式监听 5173
npm run preview -- --host 0.0.0.0 --port 5173 > ../frontend.log 2>&1 &

echo -e "${YELLOW}------------------------------------------${NC}"
echo -e "${GREEN}服务器启动成功！${NC}"
echo -e "后端运行在: ${YELLOW}http://服务器IP:8000${NC}"
echo -e "前端预览在: ${YELLOW}http://服务器IP:5173${NC}"
echo -e "提示: 如果你使用域名访问，请确保宝塔面板/Nginx 指向了 frontend/dist 目录${NC}"
echo -e "查看日志: tail -f backend.log 或 tail -f frontend.log"
echo -e "${YELLOW}------------------------------------------${NC}"
