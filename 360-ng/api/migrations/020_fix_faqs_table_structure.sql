-- Fix faqs table structure to use category_id foreign key instead of category varchar
-- Made idempotent to handle partial migrations

-- Add the category_id column if it doesn't exist
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'faqs' AND column_name = 'category_id');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE faqs ADD COLUMN category_id INT NULL AFTER id', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update category_id based on existing category names (only if category column exists)
SET @category_col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'faqs' AND column_name = 'category');
SET @sql = IF(@category_col_exists > 0, 'UPDATE faqs f JOIN faq_categories c ON f.category = c.name SET f.category_id = c.id WHERE f.category_id IS NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Set default category for any unmatched rows
UPDATE faqs SET category_id = (SELECT id FROM faq_categories WHERE slug = 'general' LIMIT 1) WHERE category_id IS NULL;

-- If still null, set to first available category
UPDATE faqs SET category_id = (SELECT id FROM faq_categories LIMIT 1) WHERE category_id IS NULL;

-- Make it NOT NULL (only if currently nullable)
SET @is_nullable = (SELECT IS_NULLABLE FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'faqs' AND column_name = 'category_id');
SET @sql = IF(@is_nullable = 'YES', 'ALTER TABLE faqs MODIFY category_id INT NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index if it doesn't exist
SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'faqs' AND index_name = 'idx_faqs_category');
SET @sql = IF(@index_exists = 0, 'ALTER TABLE faqs ADD INDEX idx_faqs_category (category_id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key if it doesn't exist
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'faqs' AND constraint_name = 'fk_faqs_category');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE faqs ADD CONSTRAINT fk_faqs_category FOREIGN KEY (category_id) REFERENCES faq_categories(id) ON DELETE CASCADE', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add created_by column if missing
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'faqs' AND column_name = 'created_by');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE faqs ADD COLUMN created_by INT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add created_by foreign key if it doesn't exist
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'faqs' AND constraint_name = 'fk_faqs_created_by');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE faqs ADD CONSTRAINT fk_faqs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop the old category varchar column if it exists
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'faqs' AND column_name = 'category');
SET @sql = IF(@column_exists > 0, 'ALTER TABLE faqs DROP COLUMN category', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
