-- Migration: Create events table
-- Description: Creates the events table for managing gym events

CREATE TABLE IF NOT EXISTS events (
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
    
    INDEX idx_events_date (date),
    INDEX idx_events_active (is_active),
    INDEX idx_events_date_active (date, is_active)
);

-- Insert sample event data
INSERT INTO events (title, date, cost, description, time, registration_link, is_active) VALUES
('Open House Event', '2024-12-15', 0.00, 'Come visit our facility and see what we have to offer! Free event for families interested in learning about our programs.', '10:00 AM - 2:00 PM', 'https://360gymnastics.com/register/open-house', TRUE),
('Parent & Tot Playtime', '2024-12-08', 15.00, 'Special playtime session for parents and toddlers (ages 18 months to 3 years). Explore our gym in a safe, supervised environment.', '10:00 AM - 11:00 AM', 'https://360gymnastics.com/register/parent-tot', TRUE),
('Birthday Party Package Demo', '2024-12-22', 25.00, 'See our amazing birthday party packages in action! Watch a demo party and learn about booking your child special day with us.', '2:00 PM - 3:30 PM', 'https://360gymnastics.com/register/party-demo', TRUE),
('New Year Fitness Challenge', '2025-01-05', 30.00, 'Start the new year right with our fitness challenge! Open to all ages and skill levels. Prizes for participation!', '6:00 PM - 8:00 PM', 'https://360gymnastics.com/register/fitness-challenge', TRUE),
('Gymnastics Showcase', '2025-02-14', 10.00, 'Watch our students perform their routines in a fun, supportive environment. Great for families and friends!', '7:00 PM - 9:00 PM', 'https://360gymnastics.com/register/showcase', TRUE),
('Community Health Fair', '2025-03-01', 0.00, 'Join us for a community health fair featuring health screenings, nutrition info, and fitness demonstrations.', '9:00 AM - 1:00 PM', 'https://360gymnastics.com/register/health-fair', TRUE);