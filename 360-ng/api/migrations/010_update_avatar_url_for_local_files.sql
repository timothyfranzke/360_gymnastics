-- Update avatar_url field to support local file paths
-- Migration 010: Update avatar_url field for local file upload support

-- Update the avatar_url field comment to reflect new usage
ALTER TABLE staff MODIFY COLUMN avatar_url VARCHAR(500) DEFAULT NULL 
COMMENT 'Path to staff member profile image (relative path for local files or full URL for external images)';

-- Add a new field to track whether avatar is local or external (optional - for future use)
-- This could be helpful for cleanup operations and determining how to serve the image
-- ALTER TABLE staff ADD COLUMN avatar_type ENUM('local', 'external') DEFAULT NULL 
-- COMMENT 'Type of avatar - local file upload or external URL';

-- Update any existing external URLs to maintain backward compatibility
-- (This would be run manually if needed to categorize existing data)

-- Note: The system now supports both:
-- 1. Local uploads: stored as relative paths like 'uploads/staff/staff_123_1234567890_abcd1234.jpg'
-- 2. External URLs: full URLs like 'https://example.com/image.jpg'
-- 
-- The Staff model formatAvatarUrls() method handles conversion to proper API endpoints
-- for local files while preserving external URLs as-is.