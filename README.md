# GPT-Image2 Relay Station

[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](https://github.com/bmdy5/ai-image-relay-station)

GPT-Image2 Relay Station 是一个基于 FastAPI 与 React 构建的高性能 AI 生图中转系统。它通过优化的异步架构，为开发者和最终用户提供稳定、极简的 DALL-E 3 (GPT-Image 2) 生图体验。

---

## 核心特性

### 1. 极致生图体验
*   **专业交互界面**：采用亮橙色极简风格设计，支持 1:1, 4:3, 16:9 等多种比例切换，支持多图同步生成预览。
*   **异步反馈系统**：后端任务队列分发，前端实时显示生成进度，告别长时间空白等待。

### 2. 商业化运营能力
*   **积分计费体系**：内置阶梯定价逻辑，支持按张扣费。支持管理员后台人工审核充值报备，实现闭环运营。
*   **完善的生图历史**：用户可随时追溯、搜索和重新下载历史生成的艺术作品。

### 3. 企业级安全防护
*   **全站熔断机制**：支持设置单日消费上限，防止 API 额度被意外或恶意耗尽。
*   **内容安全过滤**：集成敏感词检测与内容安全审核。
*   **多维身份校验**：基于 JWT 的认证体系，辅以浏览器指纹校验，提升账户安全性。

---

## 技术架构

| 维度 | 技术栈 |
| :--- | :--- |
| **前端** | React 18, Vite, Axios, React Router, Lucide Icons, Vanilla CSS |
| **后端** | FastAPI (Python 3.10+), SQLAlchemy, Pydantic, Bcrypt, PyJWT |
| **数据库** | MySQL 5.7+ / MariaDB |
| **部署** | Vercel (Frontend & API), Tencent Cloud (Database) |

---

## 快速上手指南

### 1. 环境准备
*   确保安装了 **Python 3.10** 或更高版本。
*   确保安装了 **Node.js** (推荐 v18+)。
*   本地或云端已启动 **MySQL** 服务。

### 2. 获取代码与安装依赖
```bash
# 安装 Python 后端依赖
pip install -r requirements.txt

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 3. 配置环境变量
复制 `.env.example` 为 `.env`，并填写以下核心配置：
*   `DATABASE_URL`: 数据库连接字符串。
*   `OPENAI_API_KEY`: 您的 OpenAI API 密钥。
*   `OPENAI_BASE_URL`: 中转或官方 API 地址。

### 4. 数据库初始化
将 `sql/init.sql` 文件导入到您的 MySQL 数据库中。该脚本会自动创建表结构、增量更新字段并初始化默认管理员账号。

### 5. 启动项目
在根目录下执行一键启动脚本：
```bash
chmod +x start.sh
./start.sh
```

---

## 云端环境信息

本项目目前已部署于腾讯云环境，方便团队协作与线上测试。

*   **服务器 IP**: `119.29.232.114`
*   **数据库配置**: 已放行远程连接权限，本地开发环境通过 `.env` 直连云端 MySQL。
*   **管理建议**: 生产环境下，请通过宝塔面板监控 `backend.log` 与 `frontend.log` 实时日志。

---

## 项目结构
```text
.
├── api/                # 接口路由层
├── backend/            # 核心业务逻辑 (Models, CRUD, Core)
├── frontend/           # React 前端工程
├── sql/                # 数据库初始化脚本
├── scripts/            # 工具脚本
└── start.sh            # 本地一键启动脚本
```

---

## 开源协议
本项目基于 [MIT License](LICENSE) 协议。
