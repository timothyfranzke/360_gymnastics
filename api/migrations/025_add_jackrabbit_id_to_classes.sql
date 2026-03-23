-- Add jackrabbit_id column to gymnastics_classes table
-- This allows mapping classes to their Jackrabbit schedule names independently of the display name

ALTER TABLE gymnastics_classes ADD COLUMN jackrabbit_id VARCHAR(255) DEFAULT NULL AFTER category;

-- Seed existing classes: use name as default jackrabbit_id
UPDATE gymnastics_classes SET jackrabbit_id = name WHERE jackrabbit_id IS NULL;

-- Index for lookups
CREATE INDEX idx_classes_jackrabbit_id ON gymnastics_classes(jackrabbit_id);
