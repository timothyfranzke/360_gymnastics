-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_id VARCHAR(20) UNIQUE,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL,
    phone VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_position (position),
    INDEX idx_department (department),
    INDEX idx_active (is_active),
    INDEX idx_hire_date (hire_date)
);