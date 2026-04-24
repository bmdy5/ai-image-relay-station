# GPT-Image2 部署指南 (Vercel)

本项目支持一键部署到 Vercel。请按照以下步骤配置环境变量。

## 1. 准备工作
- 确保您有一个 MySQL 数据库（如腾讯云、阿里云或 PlanetScale）。
- 获取您的 OpenAI API Key。

## 2. Vercel 环境变量配置
在 Vercel 控制面板中，添加以下 `Environment Variables`:

| 变量名 | 示例值 | 说明 |
| :--- | :--- | :--- |
| `DATABASE_URL` | `mysql+pymysql://user:pass@host:3306/db` | MySQL 连接地址 |
| `SECRET_KEY` | `随便写一串字符` | 用于生成登录令牌 |
| `OPENAI_API_KEY` | `sk-xxxx` | 您的 OpenAI 密钥 |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | 可选，用于配置中转地址 |

## 3. 部署命令
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---
祝您的产品大卖！
