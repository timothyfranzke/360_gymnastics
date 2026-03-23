-- Migration: Create class_page_settings table
-- Description: Stores editable content for the classes page (description, pricing tiers, registration fee)

CREATE TABLE IF NOT EXISTS class_page_settings (
    id INT PRIMARY KEY DEFAULT 1,
    description TEXT NOT NULL,
    pricing_tiers JSON NOT NULL,
    registration_fee VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default content
INSERT INTO class_page_settings (id, description, pricing_tiers, registration_fee) VALUES (
    1,
    'We offer a variety of classes for all ages and skill levels. Our experienced instructors provide a fun, no-pressure atmosphere while teaching the fundamentals of gymnastics, social skills, and life skills.',
    '[{"duration": "50 minute class", "price": "$69/month"}, {"duration": "55 minute class", "price": "$74/month"}, {"duration": "60 minute class", "price": "$82/month"}, {"duration": "90 minute class", "price": "$97/month"}]',
    '$15 annual registration fee per person ($30 max per family)'
);
