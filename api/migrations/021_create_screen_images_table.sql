-- Create screen_images table for assigning gallery images to screen positions
-- Migration: 021_create_screen_images_table.sql

CREATE TABLE IF NOT EXISTS screen_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    screen_key VARCHAR(100) NOT NULL,
    position_key VARCHAR(100) NOT NULL,
    gallery_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- One image per screen+position combination
    UNIQUE KEY unique_screen_position (screen_key, position_key),

    -- Foreign keys
    FOREIGN KEY (gallery_id) REFERENCES gallery(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

    -- Indexes
    INDEX idx_screen_images_screen (screen_key),
    INDEX idx_screen_images_gallery (gallery_id),
    INDEX idx_screen_images_active (is_active)
);
