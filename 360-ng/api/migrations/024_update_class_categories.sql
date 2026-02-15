-- Migration: Update class categories
-- Description: Updates class categories to match the new category structure

-- Clear existing categories first
UPDATE gymnastics_classes SET category = NULL;

-- PRESCHOOL classes
UPDATE gymnastics_classes SET category = 'PRESCHOOL' WHERE id = 'parent-tot';
UPDATE gymnastics_classes SET category = 'PRESCHOOL' WHERE id = 'threes';
UPDATE gymnastics_classes SET category = 'PRESCHOOL' WHERE id = 'beginner-preschool';
UPDATE gymnastics_classes SET category = 'PRESCHOOL' WHERE id = 'advanced-preschool';

-- LEVEL CLASSES
UPDATE gymnastics_classes SET category = 'LEVEL CLASSES' WHERE id = 'level-1';
UPDATE gymnastics_classes SET category = 'LEVEL CLASSES' WHERE id = 'level-2';
UPDATE gymnastics_classes SET category = 'LEVEL CLASSES' WHERE id = 'level-3';
UPDATE gymnastics_classes SET category = 'LEVEL CLASSES' WHERE id = 'level-4';

-- BOYS CLASSES
UPDATE gymnastics_classes SET category = 'BOYS CLASSES' WHERE id = 'beginner-boys';
UPDATE gymnastics_classes SET category = 'BOYS CLASSES' WHERE id = 'advanced-boys';

-- TUMBLING
UPDATE gymnastics_classes SET category = 'TUMBLING' WHERE id = 'tumbling';
UPDATE gymnastics_classes SET category = 'TUMBLING' WHERE id = 'tumbling-13';

-- OTHER (for any uncategorized classes like adult, homeschool)
UPDATE gymnastics_classes SET category = 'OTHER' WHERE id IN ('adult-gymnastics', 'homeschool-classes');
