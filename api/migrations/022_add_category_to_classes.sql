-- Migration: Add category column to gymnastics_classes table
-- Description: Adds a category field for grouping classes on the frontend

ALTER TABLE gymnastics_classes
ADD COLUMN category VARCHAR(100) DEFAULT NULL AFTER featured;

-- Add index for category lookups
ALTER TABLE gymnastics_classes
ADD INDEX idx_classes_category (category);

-- Update existing classes with default categories based on their names
UPDATE gymnastics_classes SET category = 'Preschool' WHERE id IN ('parent-tot', 'threes', 'beginner-preschool', 'advanced-preschool');
UPDATE gymnastics_classes SET category = 'Recreational' WHERE id IN ('level-1', 'level-2', 'level-3', 'level-4');
UPDATE gymnastics_classes SET category = 'Boys' WHERE id IN ('beginner-boys', 'advanced-boys');
UPDATE gymnastics_classes SET category = 'Specialty' WHERE id IN ('tumbling', 'adult-gymnastics', 'homeschool-classes');
