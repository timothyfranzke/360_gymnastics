-- Create pages table for the block-based page builder
CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content JSON NOT NULL,
    is_published TINYINT(1) NOT NULL DEFAULT 0,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create page_images table for images uploaded within page blocks
CREATE TABLE IF NOT EXISTS page_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT DEFAULT 0,
    mime_type VARCHAR(50) NOT NULL,
    dimensions_width INT NULL,
    dimensions_height INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL,
    INDEX idx_page_id (page_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
