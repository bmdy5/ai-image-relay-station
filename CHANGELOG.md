# 更新日志

## 2026.05.14

### 新增功能
- **积分兑换码系统**：支持通用兑换码领取积分（默认 50 积分）。
- **管理后台面板**：新增兑换码管理 Tab，支持实时查看兑换进度、新增兑换码、启停兑换码。
- **多维度安全防护**：
    - 数据库悲观锁 (`with_for_update`) 解决高并发超卖问题。
    - 联合唯一索引保证“一人一码一次”。
    - 设备指纹追踪，限制单个设备最多领取 3 个账号。
- **移动端适配**：个人中心新增兑换中心抽屉，UI 交互完全适配。

### 问题修复
- **MobileLayout 错误修正**：修复了 `isWechat` 未定义导致的 PWA 安装入口显示逻辑 Bug。
- **Lint 规范化**：移除了多处未使用的导入（React）和变量（isInstalled, err）。

### 代码优化
- **Effect 性能优化**：对 `MobileLayout` 的 `fetchUserInfo` 进行了 `useCallback` 封装。
- **并发与竞态保护**：在 `useEffect` 中引入 `ignore` 标记位和 `setTimeout` 延迟执行，彻底解决了级联渲染报错，并增强了组件卸载时的安全性。


## 2026.05.09

### 问题修复
- PWA 安装弹窗在 HTTP 环境下点击无反应：Android HTTP 环境下 `isInstallable` 为 false，安装按钮不渲染导致弹窗无交互

### 文档修正
- README：修正宽高比描述、删除不存在的功能声明、修正部署架构和技术栈版本
- API 手册：补充 `/auth/daily-reward` 端点、修正 master 档位增强词描述
- 数据库文档：补充 `last_daily_reward`、`generation_duration` 字段，修正 `style` 默认值
- PRD：修正 master 增强词、风格数量
- 架构概览：升级技术栈版本号、补充 `services/` 目录结构

## 2026.05.08

### 新增功能
- 每日签到领积分：`POST /auth/daily-reward`，+5 积分，MySQL GET_LOCK 防并发
- PWA 安装弹窗：Android 一键安装 / iOS 引导 / 微信提示，7 天内不重复
- 游客模式可视化：橙色标签、弹窗引导、个人中心横幅
- 微信环境检测：顶部绿色提示横幅引导浏览器打开
- userInfo localStorage 缓存加速，登录后即时显示积分
- 自定义下载图片命名

### 问题修复
- OpenAI API 503/429 自动重试，递进等待 2s/4s
- 维护弹窗：死循环 → 健康检查轮询，连续错误阈值 + 时间窗口
- 断网后旧任务永久转圈：后端超时 + 过期检测 + 连续错误三层防护
- 手机号注册无邀请码时 `db.commit()` 缺失导致用户数据丢失
- SQL LIKE `_` 通配符误匹配 → 改用 REGEXP
- `recharge.py` 缺少 `from datetime import datetime`
- `isGuest` 残留导致已登录用户显示游客模式
- `beforeinstallprompt` 事件提前到 React 挂载前捕获
- PWA 已安装时清除 dismiss 标记，卸载后可重装

### 交互优化
- 输入框 placeholder 移除，改为上方 💡 hint 引导行
- 风格对象新增 `hint` 字段，`placeholder` 仅保留后端模板使用
- 登录/注册页协议勾选 + TermsModal 完整协议文本
- 公告版本号改为日期格式

### 代码清理
- 清理 `prompt.py` 中不存在的 anime 风格死代码
- 仓库深度清理与文档专业化重构
- API 路由与业务服务解耦（image / auth 模块）

### 基础设施
- 修复数据库溢出和 SSH 隧道稳定性问题
- 时区不匹配修复（auth / recharge 模块）
- 验证码并发重复发送修复（MySQL GET_LOCK 非阻塞锁）
- 图生图协议兼容性修复 + Pillow 图像净化层
