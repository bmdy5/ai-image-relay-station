# 积分兑换码系统设计规范 (Redemption Code System)

> **状态**：✅ 已完成 (2026-05-14)
> **分支**：`dev` (Merged from `feat/redemption-code`)

## 1. 业务概述
实现一套安全、通用的兑换码系统，用于奖励用户积分。支持额度控制、时间控制以及防薅羊毛限制。

| 问题 | 决策 |
|------|------|
| 总量上限 | 每个码最多 100 人可兑换 (`max_uses = 100`) |
| 有效期管理 | 自动有效期：通过 `start_time` / `end_time` 字段控制 |
| 防小号机制 | 同一设备指纹（fingerprint）最多允许 3 个账号兑换同一码 |
| 后台管理 | 在 AdminPage 新增兑换码管理 UI（创建 / 启停） |

## 2. 数据库模型 (Database Models)

### `redemption_codes` (兑换码配置表)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Integer, PK | 主键 |
| `code` | String(50), Unique, Index | 兑换码文本，例如 WELCOME50 |
| `points` | Integer, Default 50 | 奖励积分数 |
| `max_uses` | Integer, Default 100 | 总兑换上限 |
| `used_count` | Integer, Default 0 | 已兑换次数（原子更新） |
| `is_active` | Boolean, Default True | 手动启停开关 |
| `start_time` | DateTime, Nullable | 生效时间（NULL 表示立即生效） |
| `end_time` | DateTime, Nullable | 过期时间（NULL 表示永不过期） |
| `created_at` | DateTime | 创建时间 |

### `redemption_records` (兑换记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Integer, PK | 主键 |
| `user_id` | Integer, FK(users.id) | 用户 ID |
| `code_id` | Integer, FK(redemption_codes.id) | 兑换码 ID |
| `fingerprint` | String, Nullable | 兑换时的设备指纹（防小号） |
| `created_at` | DateTime | 兑换时间 |

**约束**：`(user_id, code_id)` 联合唯一索引（`UniqueConstraint`），从数据库层面防止同一用户重复领取。

## 3. 后端接口 (Backend API)

### `POST /user/redeem`
**请求体**: `{ "code": "string" }`

**执行流程（严格顺序）**：
1. **频率限制**：同一 user_id 兑换接口每分钟最多 5 次请求，超出返回 429。
2. **有效性校验**：查询 `redemption_codes`，要求 `is_active=True`、当前时间在 `[start_time, end_time]` 范围内，否则返回 400「兑换码无效或已过期」。
3. **库存校验**：`used_count < max_uses`，否则返回 400「该兑换码已达到兑换上限」。
4. **重复校验**：查询 `redemption_records`，若存在 `(user_id, code_id)` 记录，返回 400「该兑换码已使用过」。
5. **防小号校验**：统计 `redemption_records` 中同一 `code_id` + 同一 `fingerprint` 的记录数，若 >= 3，返回 400「该设备已达到兑换上限」。
6. **事务处理**（原子操作）：
   - `UPDATE redemption_codes SET used_count = used_count + 1 WHERE id = :id AND used_count < max_uses`（悲观锁，防超卖）
   - `User.points += code.points`
   - 插入 `redemption_records` 记录
   - 提交事务

**返回**：`{ "message": "兑换成功！已到账 50 积分", "points_added": 50 }`

### 管理后台接口（Admin only）
- `POST /admin/redemption-codes`：创建新的兑换码
- `GET /admin/redemption-codes`：获取所有兑换码列表（含使用进度）
- `PATCH /admin/redemption-codes/{id}`：修改 `is_active` 状态

## 4. 前端界面 (Frontend UI)

### PC 端 (`PCProfilePage.jsx`)
- 侧边栏新增 Tab 「兑换中心」（图标 `Gift`），位于「邀请奖励」之下。
- 右侧内容区显示一个白色卡片（`background: white, borderRadius: 24px, border: 1px solid var(--border)`）。
- 卡片内：输入框（`#f9f9fb` 背景，`border-radius: 12px`）+ 「立即兑换」按钮（复用 `btn-primary` 样式）横向排列。
- 兑换成功后：`alert()` 提示成功并调用 `fetchData()` 刷新积分。

### 移动端 (`MobileProfilePage.jsx`)
- 「账户设置」分组中新增 `SettingItem`「兑换中心」（图标 `Gift`）。
- 点击后弹出 `MobileDrawer` 底部抽屉，内含提示文案、输入框（`#F2F2F7` 背景，`border-radius: 16px`）和「确认兑换」按钮。
- 成功 / 失败均使用 `alert()` 通知。

### AdminPage (`AdminPage.jsx`)
- 新增一个「兑换码管理」分区（Tab 或 Section）。
- 功能：展示兑换码列表（code / 奖励积分 / 进度 used_count/max_uses / 有效期 / 状态）、新建兑换码表单、启停操作按钮。

## 5. 数据库迁移 (Migration)
- 新增 `sql/patch_v1.3_redemption.sql`：创建两张新表及索引。
- 插入一条初始示例兑换码：`WELCOME50`，`points=50`，`max_uses=100`，永久有效。
