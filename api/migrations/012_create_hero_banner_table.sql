-- Create hero_banner table for managing banner displays
CREATE TABLE IF NOT EXISTS hero_banner (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(500) NOT NULL DEFAULT 'Welcome to 360 Gym!',
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    background_color VARCHAR(7) DEFAULT '#1e40af',
    text_color VARCHAR(7) DEFAULT '#ffffff',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_visible (is_visible),
    INDEX idx_created_by (created_by),
    INDEX idx_updated_at (updated_at)
);

-- Insert default banner configuration
INSERT INTO hero_banner (message, is_visible, background_color, text_color, created_by) 
VALUES ('Enrolling for 2025!', TRUE, '#1e40af', '#ffffff', 1)
ON DUPLICATE KEY UPDATE id=id;