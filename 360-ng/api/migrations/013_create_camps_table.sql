-- Migration: Create camps table
-- Description: Creates the camps table for managing gym camp events

CREATE TABLE IF NOT EXISTS camps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL,
    time VARCHAR(100) NOT NULL,
    registration_link VARCHAR(500) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_camps_date (date),
    INDEX idx_camps_active (is_active),
    INDEX idx_camps_date_active (date, is_active)
);

-- Insert sample camp data
INSERT INTO camps (title, date, cost, description, time, registration_link, is_active) VALUES
('Spring Break Gymnastics Camp', '2024-03-25', 125.00, 'A fun-filled week of gymnastics training during spring break. Perfect for beginners and intermediate gymnasts aged 6-12.', '9:00 AM - 3:00 PM', 'https://360gymnastics.com/register/spring-camp', TRUE),
('Summer Intensive Training Camp', '2024-07-15', 200.00, 'Intensive training camp for competitive gymnasts. Focus on skill development, conditioning, and routine preparation.', '8:00 AM - 4:00 PM', 'https://360gymnastics.com/register/summer-intensive', TRUE),
('Holiday Fun Camp', '2024-12-20', 100.00, 'Holiday-themed gymnastics camp with games, crafts, and gymnastics activities. Great for kids aged 4-10.', '10:00 AM - 2:00 PM', 'https://360gymnastics.com/register/holiday-camp', TRUE),
('Advanced Skills Workshop', '2024-11-10', 150.00, 'Advanced skills workshop for level 4+ gymnasts. Focus on back handsprings, back tucks, and advanced bar skills.', '1:00 PM - 5:00 PM', 'https://360gymnastics.com/register/advanced-workshop', TRUE),
('Winter Break Mini Camp', '2024-12-28', 80.00, 'Short winter break camp for kids to stay active during the holidays. Ages 5-12 welcome.', '9:00 AM - 1:00 PM', 'https://360gymnastics.com/register/winter-mini', TRUE),
('Tumbling Fundamentals Camp', '2024-06-01', 110.00, 'Learn basic tumbling skills including handstands, cartwheels, and rolls. Perfect for beginners ages 4-8.', '10:00 AM - 2:00 PM', 'https://360gymnastics.com/register/tumbling-fundamentals', TRUE);