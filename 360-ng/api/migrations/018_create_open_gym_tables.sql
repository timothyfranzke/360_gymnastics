-- Create open_gym table for main and structured configurations
CREATE TABLE IF NOT EXISTS open_gym (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('main', 'structured') NOT NULL,
    title VARCHAR(200),
    subtitle VARCHAR(500),
    description TEXT,
    schedule JSON,
    features JSON,
    important_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_type (type)
);

-- Create open_gym_age_groups table for age group cards
CREATE TABLE IF NOT EXISTS open_gym_age_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(200),
    days VARCHAR(100),
    time VARCHAR(100),
    price DECIMAL(10,2),
    price_unit VARCHAR(50) DEFAULT 'per session',
    notes TEXT,
    sort_order INT DEFAULT 0,
    color_theme VARCHAR(50) DEFAULT 'cyan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default structured configuration
INSERT INTO open_gym (type, title, subtitle, description, features, important_info) 
VALUES (
    'structured',
    'Structured Open Gym',
    'Sundays 5:30-7:00 PM',
    'Perfect for gymnasts who want to work on improving their skills with guidance from our experienced coaches. Playtime is NOT PERMITTED during this focused training session.',
    '["Experienced coach available for spotting", "Skill-focused stations setup", "Technique corrections and guidance"]',
    '["See the Open Gym calendar below to register for structured sessions."]'
) ON DUPLICATE KEY UPDATE type=type;

-- Insert default age groups
INSERT INTO open_gym_age_groups (title, subtitle, days, time, price, price_unit, sort_order, color_theme) 
VALUES 
(
    'Ages 6 & Under',
    'Parents must accompany children',
    'Monday, Wednesday, Friday',
    '12:00 PM - 1:00 PM',
    5.00,
    'per session',
    1,
    'cyan'
),
(
    'Ages 16 & Under',
    'Parents must accompany children under 6',
    'Saturday',
    '2:00 PM - 3:30 PM',
    10.00,
    'per session',
    2,
    'orange'
);