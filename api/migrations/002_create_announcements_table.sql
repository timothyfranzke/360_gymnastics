-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('general', 'class', 'maintenance', 'event', 'closure') NOT NULL DEFAULT 'general',
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    start_date DATE NOT NULL,
    end_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_type (type),
    INDEX idx_priority (priority),
    INDEX idx_active (is_active),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);