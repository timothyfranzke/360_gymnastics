-- Simplify staff table to standalone structure without users dependency
-- Migration 011: Remove user relationship and auth fields, focus on basic staff info

-- Create new simplified staff table
CREATE TABLE IF NOT EXISTS staff_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    image VARCHAR(500) DEFAULT NULL COMMENT 'Path to staff member image',
    description TEXT DEFAULT NULL COMMENT 'Staff member description/bio',
    hire_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_first_name (first_name),
    INDEX idx_last_name (last_name),
    INDEX idx_hire_date (hire_date),
    INDEX idx_name (first_name, last_name)
);

-- Migrate existing data (first_name, last_name from users, description, hire_date from staff)
INSERT INTO staff_new (first_name, last_name, image, description, hire_date, created_at, updated_at)
SELECT 
    u.first_name,
    u.last_name,
    s.avatar_url as image,
    s.description,
    s.hire_date,
    s.created_at,
    s.updated_at
FROM staff s
INNER JOIN users u ON s.user_id = u.id
WHERE u.role IN ('staff', 'admin');

-- Drop old staff table
DROP TABLE staff;

-- Rename new table to staff
ALTER TABLE staff_new RENAME TO staff;