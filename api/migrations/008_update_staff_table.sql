-- Update staff table: add description field and remove salary field

-- Add description field for HTML content
ALTER TABLE staff ADD COLUMN description TEXT;

-- Remove salary field
ALTER TABLE staff DROP COLUMN salary;