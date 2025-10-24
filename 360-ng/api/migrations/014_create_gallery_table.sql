-- Create gallery table for managing photo gallery
-- Migration: 014_create_gallery_table.sql

CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    alt_text TEXT,
    caption TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) NOT NULL,
    dimensions_width INT DEFAULT NULL,
    dimensions_height INT DEFAULT NULL,
    order_index INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_gallery_order (order_index),
    INDEX idx_gallery_active (is_active),
    INDEX idx_gallery_featured (is_featured),
    INDEX idx_gallery_created (created_at),
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert some sample gallery data
INSERT INTO gallery (filename, original_filename, alt_text, caption, file_path, file_size, mime_type, dimensions_width, dimensions_height, order_index, is_featured, is_active) VALUES
('gallery-gym-action-1.jpg', 'gym-action-1.jpg', 'Gymnast performing on balance beam', 'Focus and determination in action', 'uploads/gallery/gallery-gym-action-1.jpg', 512000, 'image/jpeg', 800, 1000, 1, TRUE, TRUE),
('gallery-team-training.jpg', 'team-training.jpg', 'Team training session', 'Building skills together', 'uploads/gallery/gallery-team-training.jpg', 486000, 'image/jpeg', 800, 1000, 2, FALSE, TRUE),
('gallery-vault-performance.jpg', 'vault-performance.jpg', 'Athlete performing vault', 'Soaring to new heights', 'uploads/gallery/gallery-vault-performance.jpg', 523000, 'image/jpeg', 800, 1000, 3, TRUE, TRUE),
('gallery-floor-routine.jpg', 'floor-routine.jpg', 'Floor routine performance', 'Grace and power combined', 'uploads/gallery/gallery-floor-routine.jpg', 498000, 'image/jpeg', 800, 1000, 4, FALSE, TRUE),
('gallery-uneven-bars.jpg', 'uneven-bars.jpg', 'Uneven bars routine', 'Strength meets artistry', 'uploads/gallery/gallery-uneven-bars.jpg', 545000, 'image/jpeg', 800, 1000, 5, FALSE, TRUE),
('gallery-young-gymnasts.jpg', 'young-gymnasts.jpg', 'Young gymnasts learning', 'Starting the journey young', 'uploads/gallery/gallery-young-gymnasts.jpg', 467000, 'image/jpeg', 800, 1000, 6, TRUE, TRUE),
('gallery-competition.jpg', 'competition.jpg', 'Competition performance', 'Competing at the highest level', 'uploads/gallery/gallery-competition.jpg', 534000, 'image/jpeg', 800, 1000, 7, FALSE, TRUE),
('gallery-coaching.jpg', 'coaching.jpg', 'Coach working with athlete', 'Expert guidance every step', 'uploads/gallery/gallery-coaching.jpg', 489000, 'image/jpeg', 800, 1000, 8, FALSE, TRUE),
('gallery-balance-beam.jpg', 'balance-beam.jpg', 'Balance beam routine', 'Perfect balance and poise', 'uploads/gallery/gallery-balance-beam.jpg', 512000, 'image/jpeg', 800, 1000, 9, FALSE, TRUE),
('gallery-parallel-bars.jpg', 'parallel-bars.jpg', 'Parallel bars routine', 'Strength in motion', 'uploads/gallery/gallery-parallel-bars.jpg', 501000, 'image/jpeg', 800, 1000, 10, FALSE, TRUE),
('gallery-rings.jpg', 'rings.jpg', 'Still rings performance', 'Upper body power display', 'uploads/gallery/gallery-rings.jpg', 478000, 'image/jpeg', 800, 1000, 11, FALSE, TRUE),
('gallery-celebration.jpg', 'celebration.jpg', 'Team celebrating success', 'Celebrating achievements together', 'uploads/gallery/gallery-celebration.jpg', 556000, 'image/jpeg', 800, 1000, 12, TRUE, TRUE);