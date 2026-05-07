# Visionary — AI 图像生成平台

[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.9-orange.svg)](https://github.com/bmdy5/ai-image-relay-station)

Visionary 是一个基于 FastAPI 与 React 构建的高性能 AI 图像生成平台。它通过优化的异步架构，为开发者和最终用户提供稳定、极简的 GPT-Image-2 生图体验，并集成了完整的积分计费与商业化运营体系。

---

## 核心特性

### 1. 极致生图体验
*   **专业交互界面**：采用亮橙色极简风格设计，支持 1:1, 4:3, 16:9 等多种比例切换，支持多图同步生成预览。
*   **异步反馈系统**：后端任务队列分发，前端实时显示生成进度，告别长时间空白等待。

### 2. 商业化运营能力
*   **积分计费体系**：内置三档阶梯定价（5/10/15 积分），支持冻结式两阶段扣费。支持在线支付（支付乐）与人工报备充值双通道。
*   **管理后台**：财务仪表盘实时展示收入/成本/利润，支持用户管理、充值审核、违规内容一键抹除。
*   **邀请返利**：邀请码 + 注册奖励 + 首画奖励，含每日限额防刷机制。
*   **PWA 桌面端**：支持安装到桌面，附赠安装奖励积分。

### 3. 企业级安全防护
*   **全站熔断机制**：支持设置单日消费上限，防止 API 额度被意外或恶意耗尽。
*   **内容安全过滤**：集成敏感词检测与内容安全审核。
*   **多维身份校验**：基于 JWT 的认证体系，辅以浏览器指纹校验，提升账户安全性。

---

## 技术架构

| 维度 | 技术栈 |
| :--- | :--- |
| **前端** | React 18, Vite 6, Axios, React Router, Lucide Icons, Vanilla CSS, PWA |
| **后端** | FastAPI (Python 3.10+), SQLAlchemy, Pydantic, Bcrypt, PyJWT, Pillow |
| **数据库** | MySQL 5.7+ / MariaDB (腾讯云, SSH 隧道连接) |
| **对象存储**| 腾讯云 COS (ap-guangzhou) |
| **AI 模型** | GPT-Image-2 (通过中转站), 通义千问 DashScope (提示词润色) |
| **支付** | 支付乐 Zhifule (微信支付, MD5 签名) |
| **部署** | Vercel (前端), 腾讯云 + 宝塔面板 (后端) |

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

本项目已部署至腾讯云生产环境。

*   **访问地址**：见 `system_configs` 表中的 `DOMAIN_NAME` 和 `SERVER_IP`
*   **数据库连接**：本地开发通过 SSH 隧道（3307→3306）连接云端 MySQL，详见 [部署指南](docs/运维指南/部署指南.md)
*   **运维管理**：通过宝塔面板监控日志，详见 [服务器维护手册](docs/运维指南/服务器维护手册.md)

---

## 项目结构
```text
.
├── api/                # FastAPI 应用入口
├── backend/            # 核心业务逻辑
│   ├── api/            # 路由层 (auth, image, payment, user, admin, feedback)
│   ├── core/           # 核心工具 (config, security, cos, email, payment, prompt)
│   ├── crud/           # 数据访问层
│   ├── models/         # ORM 模型 (SQLAlchemy)
│   ├── schemas/        # Pydantic 校验
│   └── services/       # 业务服务 (image_service, auth_service)
├── frontend/           # React + Vite 前端工程
├── docs/               # 项目文档 (PRD/API手册/架构概览/运维指南)
├── sql/                # 数据库初始化及补丁脚本
├── scripts/            # 工具脚本
├── start.sh            # 本地一键启动 (含 SSH 隧道守护)
└── server_start.sh     # 服务器端启动脚本
```

---

## 文档

完整文档见 [docs/](docs/) 目录：

- [产品需求文档](docs/核心文档/产品需求文档.md)
- [架构概览](docs/核心文档/架构概览.md)
- [API 参考手册](docs/技术规范/API参考手册.md)
- [部署指南](docs/运维指南/部署指南.md)
- [服务器维护手册](docs/运维指南/服务器维护手册.md)

## 开源协议
本项目基于 [MIT License](LICENSE) 协议。
