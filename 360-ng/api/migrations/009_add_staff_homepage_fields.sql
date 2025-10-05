-- Add staff homepage display fields
-- Migration 009: Add avatar_url, description update, display_on_homepage, and display_order fields

-- Add avatar_url field for staff profile images
ALTER TABLE staff ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL COMMENT 'URL to staff member profile image';

-- Modify description field to ensure it can handle HTML content properly
ALTER TABLE staff MODIFY COLUMN description TEXT DEFAULT NULL COMMENT 'HTML-formatted staff bio/description';

-- Add display_on_homepage field to control which staff show on home page
ALTER TABLE staff ADD COLUMN display_on_homepage BOOLEAN DEFAULT FALSE COMMENT 'Whether to display this staff member on homepage';

-- Add display_order field for ordering staff on home page
ALTER TABLE staff ADD COLUMN display_order INT DEFAULT 0 COMMENT 'Order for displaying staff on homepage (ASC)';

-- Add indexes for performance
ALTER TABLE staff ADD INDEX idx_display_on_homepage (display_on_homepage);
ALTER TABLE staff ADD INDEX idx_display_order (display_order);
ALTER TABLE staff ADD INDEX idx_homepage_display (display_on_homepage, display_order);