# 数据库文档 (Database Spec)

## 1. 数据库类型
*   **开发/第一版**：SQLite (文件路径: `data/database.sqlite`)
*   **后续扩展**：MySQL / TiDB Cloud

## 2. 数据表结构

### 2.1 用户表 (`users`)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INTEGER | 主键，自增 |
| username | TEXT | 用户名 (Unique) |
| password_hash | TEXT | Bcrypt 加密后的密码 |
| fingerprint | TEXT | 浏览器识别码 |
| points | INTEGER | 剩余积分 |
| last_ip | TEXT | 最后一次访问 IP |
| is_admin | INTEGER | 0:普通用户, 1:管理员 |
| created_at | DATETIME | 创建时间 |

### 2.2 生图日志表 (`image_logs`)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 关联用户 ID |
| prompt | TEXT | 原始提示词 |
| quality | TEXT | low / mid / high |
| cost_points | INTEGER | 实际扣除积分 |
| image_url | TEXT | OpenAI 返回的图片链接 |
| status | TEXT | success / failed |
| error_msg | TEXT | 失败原因 |
| created_at | DATETIME | 生成时间 |

### 2.3 充值日志表 (`recharge_logs`)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 目标用户 ID |
| amount | INTEGER | 充值积分数 |
| operator_id | INTEGER | 操作员 ID |
| created_at | DATETIME | 充值时间 |
