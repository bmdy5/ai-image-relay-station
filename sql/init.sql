-- 创建数据库 (您可以根据需要修改数据库名)
CREATE DATABASE IF NOT EXISTS gpt_image_relay DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gpt_image_relay;

-- 用户表
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '加密密码',
    `fingerprint` VARCHAR(100) COMMENT '浏览器识别码',
    `points` INT DEFAULT 10 COMMENT '剩余积分',
    `last_ip` VARCHAR(45) COMMENT '最后访问IP',
    `is_admin` TINYINT(1) DEFAULT 0 COMMENT '是否管理员',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 生图日志表
CREATE TABLE `image_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `prompt` TEXT COMMENT '提示词',
    `quality` VARCHAR(20) COMMENT '画质规格',
    `cost_points` INT COMMENT '消耗积分',
    `image_url` VARCHAR(1000) COMMENT '图片链接',
    `status` VARCHAR(20) COMMENT '状态',
    `error_msg` TEXT COMMENT '失败原因',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 充值日志表
CREATE TABLE `recharge_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `amount` INT COMMENT '充值金额',
    `operator_id` INT COMMENT '操作员ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
