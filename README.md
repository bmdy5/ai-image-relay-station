# GPT-Image2 Relay Station (AI 中转生图站) 🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)

**GPT-Image2 Relay Station** 是一个基于 FastAPI 和 React 构建的高端 AI 生图中转平台。它旨在通过极简的配置，让用户能够绕过复杂的海外支付，直接体验 GPT-Image 2 (Dall-E 3) 的强大生图能力。

## ✨ 核心特性

- 🎨 **专业生图界面**：采用亮橙色极简风设计，支持比例切换、多图输出。
- 🪙 **积分计费系统**：按量计费，支持管理员手动充值与精准扣费。
- 🛡️ **安全风险控制**：集成单日全站消费熔断、敏感词过滤以及浏览器指纹校验。
- ⚡ **极速响应**：后端异步处理，前端实时动效反馈。
- 📦 **一键部署**：完美适配 Vercel，提供本地一键启动脚本。

## 🛠 技术栈

- **前端**: React 18, Vite, Axios, React Router
- **后端**: FastAPI, SQLAlchemy (MySQL), Pydantic, Bcrypt, JWT
- **环境**: Python 3.14+

## 🚀 快速开始

### 本地运行
1. 克隆项目并配置 `.env` 文件。
2. 确保已安装 MySQL 并导入 `sql/init.sql`。
3. 在根目录执行启动脚本：
   ```bash
   ./start.sh
   ```

### 生产环境
1. 参考 `Vercel-Readme.md` 进行 Vercel 部署。
2. 配置 `DATABASE_URL` 和 `OPENAI_API_KEY` 环境变量。

## 📸 预览

> (此处可放入您的网页截图)

## 📄 开源协议
本项目遵循 MIT 协议。
