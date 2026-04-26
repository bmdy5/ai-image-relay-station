CREATE TABLE IF NOT EXISTS `system_configs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `config_key` VARCHAR(100) UNIQUE NOT NULL COMMENT '配置项名称',
    `config_value` TEXT COMMENT '配置内容',
    `description` VARCHAR(255) COMMENT '配置描述',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化 Key 配置（如果不存在）
INSERT IGNORE INTO `system_configs` (`config_key`, `config_value`, `description`) VALUES 
('OPENAI_API_KEY', '', 'OpenAI API 密钥'),
('OPENAI_BASE_URL', 'https://api.openai.com/v1', 'API 请求基础地址');
