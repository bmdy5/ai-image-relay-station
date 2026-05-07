# API 参考手册

本手册基于 `backend/api/` 全量代码审计编写，描述了所有真实存在的接口端点。

> **Base URL**: `/api`（由 `api/index.py` 统一挂载）
> **认证方式**: `Authorization: Bearer {JWT_TOKEN}`

---

## 1. 认证模块 `/auth`

| 方法 | 端点 | 是否需鉴权 | 说明 |
| :--- | :--- | :--- | :--- |
| POST | `/auth/send-code` | 否 | 发送注册验证码（60s 内只能发一次，邮箱已注册则拒绝） |
| POST | `/auth/register` | 否 | 邮箱注册（需验证码，限 100 人内测，支持邀请码） |
| POST | `/auth/register-phone` | 否 | 手机号注册（无验证码，11位手机号，支持邀请码） |
| POST | `/auth/login` | 否 | 登录（支持用户名 / 邮箱 / 手机号三种方式） |
| GET | `/auth/me` | 是 | 获取当前登录用户信息 |
| POST | `/auth/bind-email` | 是 | 为手机号账号绑定邮箱 |
| POST | `/auth/bind-phone` | 是 | 为邮箱账号绑定手机号 |
| POST | `/auth/change-password` | 是 | 修改密码（需绑定邮箱验证码） |
| POST | `/auth/forgot-password/send-code` | 否 | 发送找回密码验证码（邮箱必须已注册） |
| POST | `/auth/forgot-password/reset` | 否 | 重置密码并自动登录 |
| POST | `/auth/claim-install-reward` | 是 | 领取 PWA 安装奖励 **+10 积分**（每人仅限一次） |
| GET | `/auth/invitation-stats` | 是 | 查看邀请统计（邀请人数、今日奖励次数、邀请链接） |

---

## 2. 生图模块 `/image`

| 方法 | 端点 | 是否需鉴权 | 说明 |
| :--- | :--- | :--- | :--- |
| GET | `/image/config` | 否 | 获取实时计费配置（积分价格 & 模型档位） |
| POST | `/image/generate` | 是 | 发起生图任务（预扣积分，异步处理） |
| GET | `/image/status/{id}` | 否 | 轮询任务状态 |
| GET | `/image/history` | 是 | 获取历史记录（分页，默认 20 条） |
| DELETE | `/image/{id}` | 是 | 删除生图记录（仅限本人） |
| POST | `/image/{log_id}/share` | 是 | 记录分享（share_count +1） |
| POST | `/image/reset` | 是 | 手动重置卡死的并发锁（清理 frozen_points 并批量标记 pending 任务为 failed） |
| POST | `/image/enhance-prompt` | 是 | 调用通义千问润色提示词（每分钟限 5 次，仅 default/real/product/tech_poster 风格可用） |
| GET | `/image/proxy` | 否 | 图片代理，绕过 CORS（参数 `url`） |
| GET | `/image/download` | 否 | 通过记录 ID 重定向到 COS 图片链接 |

### 2.1 `POST /image/generate` 参数详解

```json
{
  "prompt": "用户输入的提示词（最长 1000 字符）",
  "quality": "standard | hd | master",
  "style": "风格 ID，如 real / travel_guide / ccd_snap 等",
  "aspect_ratio": "1:1 | 9:16 | 16:9",
  "ref_image_url": "参考图 URL 或 Base64（触发图生图模式）",
  "parent_id": "迭代的父任务 ID（可选）",
  "root_id": "迭代链根 ID（可选）",
  "iteration": "当前迭代次数（默认 0）"
}
```

#### 图生图协议说明

当 `ref_image_url` 非空时，后端自动切换至图生图模式：

- **端点**：`/v1/images/edits`（文生图走 `/v1/images/generations`）
- **协议**：**Binary Multipart Stream**（`multipart/form-data`），非 JSON
  - 图片作为 `image` 字段以二进制字节流直接传送
  - 其余参数（`model`, `prompt`, `n`, `quality`, `size`）作为 form data
- **预处理**：参考图在进入 API 前经过 Pillow 净化层——强制 1:1 中心裁剪 + 1024x1024 LANCZOS 缩放
- **文生图额外参数**：仅文生图模式携带 `response_format: "url"` 和 `input_fidelity: "low"`，图生图模式下这些字段不发送（避免中转站 400 错误）

### 2.2 计费规则（代码实测）

| 档位 | 积分消耗 | 迭代上限 | 实际差异 |
| :--- | :--- | :--- | :--- |
| `standard` | **5 积分** | 不支持迭代 | 基础提示词 |
| `hd` | **10 积分** | 最多 2 次变体 | 提示词追加 `high quality, 4k, sharp focus` |
| `master` | **15 积分** | 最多 3 次变体 | 提示词追加 `masterpiece, 8k, cinematic lighting` |

> **分辨率**：由 `aspect_ratio` 参数决定（`1:1`→1024x1024, `9:16`→1024x1536, `16:9`→1536x1024），**与档位无关**。所有档位统一使用 `quality: "low"` 以控制 API 成本。

### 2.3 迭代限制（代码实测）

| 档位 | 最大变体次数（基于同一 root_id） |
| :--- | :--- |
| `standard` | 0（不支持迭代） |
| `hd` | 2 次 |
| `master` | 3 次 |

---

## 3. 支付模块 `/payment`

| 方法 | 端点 | 是否需鉴权 | 说明 |
| :--- | :--- | :--- | :--- |
| POST | `/payment/create` | 是 | 创建在线支付订单，返回支付乐跳转链接 |
| GET | `/payment/notify` | 否 | 支付乐异步回调（签名验证后自动到账） |
| GET | `/payment/status/{out_trade_no}` | 否 | 前端轮询订单状态 |

### 3.1 充值套餐（代码实测）

| 充值金额 | 获得积分 | 备注 |
| :--- | :--- | :--- |
| ¥1.00 | 20 积分 | 1 元特惠，**每人仅限一次**；再次购买按 10 积分计算 |
| ¥10.00 | 150 积分 | 优惠套餐 |
| ¥30.00 | 500 积分 | 优惠套餐 |
| ¥50.00 | 800 积分 | 优惠套餐 |
| 自定义金额 | 金额 × 10 | 如 ¥5 → 50 积分 |

---

## 4. 用户模块 `/user`

| 方法 | 端点 | 是否需鉴权 | 说明 |
| :--- | :--- | :--- | :--- |
| POST | `/user/recharge/apply` | 是 | 人工报备充值（上传截图，等待管理员审核） |
| GET | `/user/consumption` | 是 | 获取全部生图消费记录 |
| GET | `/user/recharge/history` | 是 | 获取充值成功记录 |

---

## 5. 管理员模块 `/admin`（需 is_admin=1）

| 方法 | 端点 | 说明 |
| :--- | :--- | :--- |
| POST | `/admin/recharge` | 手动给指定用户加积分 |
| GET | `/admin/recharge/pending` | 查看待审核的人工报备订单（在线支付订单不在此列） |
| POST | `/admin/recharge/audit/{log_id}` | 审核通过/驳回人工报备（严禁干预在线支付订单） |
| GET | `/admin/dashboard/stats` | 仪表盘：用户数、总收入、积分消耗、风格排行、最近动态 |
| DELETE | `/admin/image/{log_id}/wipe` | 彻底抹除违规图片（同步删除 COS 文件） |
| GET | `/admin/invitation/logs` | 邀请奖励审计日志 |

---

## 6. 反馈模块 `/feedback`

| 方法 | 端点 | 是否需鉴权 | 说明 |
| :--- | :--- | :--- | :--- |
| POST | `/feedback/submit` | 否（支持游客） | 提交意见反馈（content 必填，contact 选填） |
| GET | `/feedback/list` | 是（管理员） | 分页获取反馈列表（默认 50 条，上限 100） |
| PATCH | `/feedback/{id}` | 是（管理员） | 更新反馈状态（`pending` → `resolved`）及处理备注 |

---
*来源: backend/api/ 全量代码审计 | 2026-05-06*

---
*来源: backend/api/ 全量代码审计 | 2026-05-06*
