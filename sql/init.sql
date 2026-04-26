-- 创建数据库 (您可以根据需要修改数据库名)
CREATE DATABASE IF NOT EXISTS gpt_image_relay DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gpt_image_relay;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '加密密码',
    `uid` VARCHAR(20) UNIQUE COMMENT '6位随机UID',
    `fingerprint` VARCHAR(100) COMMENT '浏览器识别码',
    `points` INT DEFAULT 10 COMMENT '剩余积分',
    `last_ip` VARCHAR(45) COMMENT '最后访问IP',
    `is_admin` TINYINT(1) DEFAULT 0 COMMENT '是否管理员',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 生图日志表
CREATE TABLE IF NOT EXISTS `image_logs` (
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
CREATE TABLE IF NOT EXISTS `recharge_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `money_amount` INT COMMENT '实际支付金额',
    `amount` INT COMMENT '对应积分',
    `screenshot_url` VARCHAR(255) COMMENT '支付截图',
    `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/success/rejected',
    `admin_note` VARCHAR(255) COMMENT '管理员备注',
    `operator_id` INT COMMENT '操作员ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 1. 增量更新逻辑 (针对已存在的表，安全添加缺少的字段)
-- =============================================
DROP PROCEDURE IF EXISTS AppPatch;
DELIMITER //
CREATE PROCEDURE AppPatch()
BEGIN
    -- 给 users 表补 uid 字段
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='uid' AND TABLE_SCHEMA=DATABASE()) THEN
        ALTER TABLE `users` ADD COLUMN `uid` VARCHAR(20) UNIQUE AFTER `password_hash`;
    END IF;

    -- 给 recharge_logs 表补新字段
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='recharge_logs' AND COLUMN_NAME='money_amount' AND TABLE_SCHEMA=DATABASE()) THEN
        ALTER TABLE `recharge_logs` ADD COLUMN `money_amount` INT AFTER `user_id`;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='recharge_logs' AND COLUMN_NAME='out_trade_no' AND TABLE_SCHEMA=DATABASE()) THEN
        ALTER TABLE `recharge_logs` ADD COLUMN `out_trade_no` VARCHAR(64) UNIQUE AFTER `operator_id`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='recharge_logs' AND COLUMN_NAME='trade_no' AND TABLE_SCHEMA=DATABASE()) THEN
        ALTER TABLE `recharge_logs` ADD COLUMN `trade_no` VARCHAR(64) UNIQUE AFTER `out_trade_no`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='recharge_logs' AND COLUMN_NAME='payment_method' AND TABLE_SCHEMA=DATABASE()) THEN
        ALTER TABLE `recharge_logs` ADD COLUMN `payment_method` VARCHAR(20) AFTER `trade_no`;
    END IF;
END //
DELIMITER ;
CALL AppPatch();
DROP PROCEDURE AppPatch;

-- =============================================
-- 2. 默认初始化数据 (密码均为 admin123)
-- =============================================
INSERT IGNORE INTO `users` (`username`, `password_hash`, `uid`, `points`, `is_admin`) VALUES 
('user', '$2b$12$0vq68moGLH98.fKm1kwV0uigsySbXsQEvqxkqQRsH97wf7lX464dq', 'USER01', 10, 0),
('admin', '$2b$12$0vq68moGLH98.fKm1kwV0uigsySbXsQEvqxkqQRsH97wf7lX464dq', 'ADMIN8', 300, 1);
