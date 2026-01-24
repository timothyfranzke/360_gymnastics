-- Fix faqs table structure to use category_id foreign key instead of category varchar

-- Add the category_id column
ALTER TABLE faqs ADD COLUMN category_id INT NULL AFTER id;

-- Update category_id based on existing category names
UPDATE faqs f
JOIN faq_categories c ON f.category = c.name
SET f.category_id = c.id;

-- Set default category (General = 5) for any unmatched rows
UPDATE faqs SET category_id = (SELECT id FROM faq_categories WHERE slug = 'general' LIMIT 1) WHERE category_id IS NULL;

-- If still null, set to first available category
UPDATE faqs SET category_id = (SELECT id FROM faq_categories LIMIT 1) WHERE category_id IS NULL;

-- Make it NOT NULL
ALTER TABLE faqs MODIFY category_id INT NOT NULL;

-- Add index and foreign key
ALTER TABLE faqs ADD INDEX idx_faqs_category (category_id);
ALTER TABLE faqs ADD CONSTRAINT fk_faqs_category FOREIGN KEY (category_id) REFERENCES faq_categories(id) ON DELETE CASCADE;

-- Add created_by column if missing
ALTER TABLE faqs ADD COLUMN created_by INT NULL;
ALTER TABLE faqs ADD CONSTRAINT fk_faqs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Drop the old category varchar column
ALTER TABLE faqs DROP COLUMN category;
