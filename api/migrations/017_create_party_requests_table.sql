-- Migration: Create party_requests table
-- Date: 2024-12-05
-- Description: Table to store birthday party booking requests

CREATE TABLE IF NOT EXISTS party_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    can_text ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    email VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    party_type VARCHAR(50) NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    child_name VARCHAR(100) NOT NULL,
    child_age INT NOT NULL CHECK (child_age >= 1 AND child_age <= 18),
    estimated_children INT NOT NULL CHECK (estimated_children >= 1 AND estimated_children <= 50),
    additional_details TEXT,
    
    -- System fields
    status ENUM('pending', 'contacted', 'confirmed', 'cancelled') DEFAULT 'pending',
    user_agent VARCHAR(500),
    ip_address VARCHAR(45),
    submitted_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_submitted_at (submitted_at),
    INDEX idx_status (status),
    INDEX idx_requested_date (requested_date),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;