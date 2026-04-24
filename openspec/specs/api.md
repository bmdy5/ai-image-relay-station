# 接口文档 (API Spec)

## 1. 基础配置
*   **Base URL**: `/api`
*   **Content-Type**: `application/json`
*   **Auth**: 采用 JWT 令牌模式，Header 携带 `Authorization: Bearer <token>`。
*   **注册限额**: 全站注册接口在达到 100 人后自动关闭并返回 403。

## 2. 用户相关接口

### 2.1 用户注册
*   **路径**: `POST /auth/register`
*   **参数**: `{"username": "...", "password": "..."}`
*   **响应**: `{"status": "success", "msg": "注册成功，欢迎成为前100名用户"}`

### 2.2 用户登录
*   **路径**: `POST /auth/login`
*   **参数**: `{"username": "...", "password": "..."}`
*   **响应**: `{"token": "eyJhbG...", "points": 10}`

### 2.3 获取用户信息
*   **路径**: `GET /user/info`
*   **响应**:
    ```json
    {
      "fingerprint": "xyz-123",
      "points": 100,
      "is_admin": false
    }
    ```

## 3. 生图相关接口

### 3.1 提交生图任务
*   **路径**: `POST /generate`
*   **参数**:
    ```json
    {
      "prompt": "a cyberpunk city",
      "quality": "low",
      "mode": "instant"
    }
    ```
*   **成功响应**:
    ```json
    {
      "image_url": "https://oaidalleapiprodscus...",
      "cost": 1
    }
    ```
*   **错误响应**:
    *   `403`: 积分不足。
    *   `400`: 触发敏感词。

## 4. 管理员接口

### 4.1 手动充值
*   **路径**: `POST /admin/recharge`
*   **Auth**: Header `X-Admin-Password`
*   **参数**:
    ```json
    {
      "target_fingerprint": "xyz-123",
      "amount": 100
    }
    ```
*   **响应**: `{"status": "success", "new_points": 200}`
