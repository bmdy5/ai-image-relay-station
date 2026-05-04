#!/bin/bash

# =================================================================
# GPT-Image2 Relay Station 一键启动脚本 (增强稳定版)
# =================================================================

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

LOG_BACKEND="backend.log"
LOG_FRONTEND="frontend.log"
LOG_TUNNEL="tunnel.log"

echo -e "${YELLOW}正在初始化环境...${NC}"

# 1. 清理旧进程
cleanup() {
    echo -e "${YELLOW}清理旧进程中...${NC}"
    # 杀死后端
    PID_BACKEND=$(lsof -t -i:8000)
    [ ! -z "$PID_BACKEND" ] && kill -9 $PID_BACKEND && echo "已关闭旧后端 (PID: $PID_BACKEND)"
    
    # 杀死前端
    PID_FRONTEND=$(lsof -t -i:5173)
    [ ! -z "$PID_FRONTEND" ] && kill -9 $PID_FRONTEND && echo "已关闭旧前端 (PID: $PID_FRONTEND)"
    
    # 杀死旧隧道
    PID_TUNNEL=$(lsof -t -i:3307)
    [ ! -z "$PID_TUNNEL" ] && kill -9 $PID_TUNNEL && echo "已关闭旧隧道 (PID: $PID_TUNNEL)"
}

cleanup

# 2. 建立自愈 SSH 隧道
start_tunnel() {
    echo -e "${GREEN}正在建立自愈 SSH 数据库隧道 (Port 3307)...${NC}"
    echo "[$(date)] 启动隧道监控..." > $LOG_TUNNEL
    
    # 在后台开启一个守护循环
    (
        while true; do
            # 检查隧道是否真的通畅 (尝试建立连接而不只是检查端口)
            if ! nc -zv 127.0.0.1 3307 > /dev/null 2>&1; then
                echo "[$(date)] 隧道检测到异常或未建立，正在强制清理并重连..." >> $LOG_TUNNEL
                # 强制清理 3307 端口，防止 "Address already in use"
                PID_OLD=$(lsof -t -i:3307)
                [ ! -z "$PID_OLD" ] && kill -9 $PID_OLD
                
                ssh -o ServerAliveInterval=30 \
                    -o ServerAliveCountMax=3 \
                    -o ConnectTimeout=10 \
                    -o ExitOnForwardFailure=yes \
                    -o StrictHostKeyChecking=no \
                    -N -L 3307:localhost:3306 root@119.29.232.114 >> $LOG_TUNNEL 2>&1
            fi
            sleep 5
        done
    ) &
    TUNNEL_MONITOR_PID=$!
    echo "隧道守护进程已启动 (PID: $TUNNEL_MONITOR_PID)"
}

start_tunnel

# 3. 等待数据库就绪
echo -e "${YELLOW}等待数据库连接就绪...${NC}"
MAX_RETRIES=10
RETRY_COUNT=0
while ! lsof -i:3307 > /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}错误: 数据库隧道建立超时，请检查网络或 SSH 密钥配置${NC}"
        echo -e "${YELLOW}提示: 请尝试手动运行 ssh root@119.29.232.114 确认是否能连通${NC}"
        exit 1
    fi
    echo -n "."
    sleep 2
done
echo -e "\n${GREEN}数据库通路已建立！${NC}"

# 4. 启动后端
echo -e "${GREEN}正在启动后端服务 (FastAPI)...${NC}"
export PYTHONPATH=$PYTHONPATH:.
python3 -m uvicorn api.index:app --host 127.0.0.1 --port 8000 > $LOG_BACKEND 2>&1 &

# 5. 启动前端
echo -e "${GREEN}正在启动前端服务 (Vite)...${NC}"
cd frontend
npm run dev > ../$LOG_FRONTEND 2>&1 &

echo -e "${YELLOW}------------------------------------------${NC}"
echo -e "${GREEN}一键启动成功！${NC}"
echo -e "后端运行在: ${YELLOW}http://127.0.0.1:8000${NC}"
echo -e "前端运行在: ${YELLOW}http://localhost:5173${NC}"
echo -e "数据库隧道: ${YELLOW}127.0.0.1:3307 -> Remote:3306${NC}"
echo -e "隧道日志: ${YELLOW}tail -f tunnel.log${NC}"
echo -e "后端日志: ${YELLOW}tail -f backend.log${NC}"
echo -e "${YELLOW}------------------------------------------${NC}"

