-- Create gym_closures table for special closures and holidays
CREATE TABLE IF NOT EXISTS gym_closures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    closure_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    is_all_day BOOLEAN DEFAULT TRUE,
    start_time TIME NULL,
    end_time TIME NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_closure_date (closure_date),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);