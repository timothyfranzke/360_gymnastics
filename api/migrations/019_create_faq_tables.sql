-- Create FAQ Categories table
CREATE TABLE IF NOT EXISTS faq_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_faq_categories_slug (slug),
    INDEX idx_faq_categories_order (display_order),
    INDEX idx_faq_categories_active (is_active)
);

-- Create FAQ Items table
CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES faq_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_faqs_category (category_id),
    INDEX idx_faqs_order (display_order),
    INDEX idx_faqs_active (is_active),
    FULLTEXT INDEX idx_faqs_fulltext (question, answer)
);

-- Insert default categories
INSERT INTO faq_categories (name, slug, description, display_order) VALUES
('Membership', 'membership', 'Questions about memberships, pricing, and enrollment', 1),
('Classes', 'classes', 'Questions about class schedules, types, and requirements', 2),
('Policies', 'policies', 'Questions about gym policies, rules, and procedures', 3),
('Facilities', 'facilities', 'Questions about our facilities and equipment', 4),
('General', 'general', 'General questions about 360 Gym', 5);
