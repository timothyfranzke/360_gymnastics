-- Migration: Create gymnastics_classes table
-- Description: Creates the gymnastics_classes table for managing gymnastics class information

CREATE TABLE IF NOT EXISTS gymnastics_classes (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age_range VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    skills JSON,
    structure JSON,
    prerequisites JSON,
    ratio VARCHAR(20),
    duration VARCHAR(50),
    url VARCHAR(255),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_classes_name (name),
    INDEX idx_classes_featured (featured),
    INDEX idx_classes_age_range (age_range),
    FULLTEXT idx_classes_search (name, description, age_range)
);

-- Insert sample gymnastics class data based on the existing frontend data
INSERT INTO gymnastics_classes (id, name, age_range, description, skills, structure, prerequisites, ratio, duration, url, featured) VALUES
('parent-tot', 'PARENT TOT', 'Ages 18mo-3yrs', 'This is a parent participation class. In this class, we will work on fine and gross motor skills, hand-eye, foot-eye coordination, listening skills, body awareness and cooperative play. This class is very active for both parent and child.', 
'["kicking, throwing, hitting a ball", "hopping with feet together, feet apart, variation of jumps", "balancing on a low beam, high beam, angled beam, wiggly beam", "swinging on bars and rings", "jumping on trampolines", "front rolls down the wedges"]', 
'[]', 
'[]', 
'10:1', '50 MIN CLASS', '/classes/parent-tot', TRUE),

('threes', 'THREES', 'Age 3-3.99yrs', 'This class is a step up from parent-tot class without participation from parents. Parents are asked to stay in the lobby during class.',
'["Floor: Forward rolls down an incline & on the floor, cartwheel progressions, handstand progressions, barrel rolls", "Bars: Swinging, pullover w/ assistance, skin the cat, around the world", "Vault: Running, jumping with feet together, landing properly", "Beam: Low beam (walking forward, backward, sideways, hopping) High beam (walking forward with assistance)", "Strength and conditioning skills are also taught."]',
'["15 minute warm up (stretch, game)", "15 minutes 1st event", "15 minutes 2nd event", "5 minutes warm down (conditioning, game)", "Strength and conditioning skills are also taught."]',
'[]',
'6:1', '50 MIN CLASS', '/classes/threes', TRUE),

('beginner-preschool', 'BEGINNER PRESCHOOL', '4-5.99yrs', 'This class is a starter class for kids who have never experienced gymnastics before. We will work on the basics of gymnastics while incorporating fun and games.',
'["Floor: Forward rolls on the floor, backward rolls down the wedge & on the floor, handstand progressions, cartwheel progressions, variations of jumps", "Bars: Swinging, pullover wwith assistance, skin the cat, around the world", "Vault: Running, jumping with feet together, landing properly", "Beam: Low beam (hops, tip toe walking, leaps) High beam (Walking forwards, sideways, Backwards by themselves)", "Strength and conditioning skills are also taught."]',
'["15 minute warm up (stretch, game)", "15 minutes 1st event", "15 minutes 2nd event", "5 minutes warm down (conditioning, game)", "Strength and conditioning skills are also taught."]',
'[]',
'6:1', '50 MIN CLASS', '/classes/beginner-preschool', FALSE),

('advanced-preschool', 'ADVANCED PRESCHOOL', '4-5.99yrs', 'This is class is geared for the children that have had gymnastics experience before. In this class we will work on more advanced gymnastics skills while still making it fun for everyone.',
'["Floor: Backbend, kickover, handstand hold, round-off", "Bars: Back hip circle, glides, tap swings, cast horizontal", "Vault: Low Beam (cartwheels, handstands, jumps), High Beam (pirouettes, turns, leaps)", "Beam: Arm swing and hurdle, handstands, handstand flat back"]',
'["15 minute warm up (stretch, game)", "15 minutes 1st event", "15 minutes 2nd event", "5 minutes warm down (conditioning, game)"]',
'["Backward roll on the floor, cartwheel, handstand, squat on vault, pullover by themselves, walk on beam (forward, backwards, hop) by themselves"]',
'6:1', '50 MIN CLASS', '/classes/advanced-preschool', FALSE),

('level-1', 'LEVEL 1', '6yrs and Older', 'This class is for children that have no gymnastics experience. We will work on basic gymnastics skills along with body awareness and physical conditioning.',
'["Floor: Forward and backward rolls, cartwheels, handstands, bridges", "Bars: Pullover with assistance, cast, swings, glides", "Beam: Walking forwards, sideways, backwards, hops, leaps", "Vault: Arm circle, running and jumping, variation of jumps"]',
'["10 minute warm up/stretch", "15 minutes 1st event", "15 minutes 2nd event", "10 minute cool down/conditioning"]',
'[]',
'8:1', '50 MIN CLASS', '/classes/level-1', TRUE),

('level-2', 'LEVEL 2', '6yrs and Older', 'This class is a step up from Level 1 so we will work on a little more advanced gymnastics skills while still mastering the basic skills. We will work on back handsprings, round offs, back hip circles, kip drills, handstands on vault, etc. See requirements below.',
'["Floor: Backbend, kickover, handstand hold, round-off", "Bars: Back hip circle, glides, tap swings, cast horizontal", "Beam: Low Beam (cartwheels, handstands, jumps), High Beam (pirouettes, turns, leaps)", "Vault: Arm swing and hurdle, handstands, handstand flat back"]',
'["10 minute warm up/stretch", "15 minutes 1st event", "15 minutes 2nd event", "10 minute cool down/conditioning"]',
'["Backward roll on the floor", "Cartwheel", "Handstand", "Squat on vault", "Pullover on bar by themselves", "Walk on beam (forward, backwards, hop) by themselves"]',
'8:1', '50 MIN CLASS', '/classes/level-2', TRUE),

('level-3', 'LEVEL 3', '6yrs and Older', 'This class is for children who have gymnastics experience and are capable of doing more advanced gymnastics. We will work on core strength, tumbling, bigger swings, and more body awareness.',
'["Floor: Back handsprings, front handsprings, round-off, back handspring progressions", "Bars: Front hip circle, jump straddle glide, cast horizontal", "Vault: Handstand flat back, front flip, front handspring", "Beam: Dismounts, cartwheels, turns, handstands"]',
'["10 minute warm up/stretch", "15 minutes 1st event", "15 minutes 2nd event", "10 minute cool down/conditioning"]',
'["Backbend kickover", "Roundoff", "Front limber", "Cast back hip circle", "Glide", "Tap swing", "Handstand flat back on vault", "Cartwheel on low beam", "Jumps on beam"]',
'8:1', '50 MIN CLASS', '/classes/level-3', FALSE),

('level-4', 'LEVEL 4', '6yrs and Older', 'This class is for children who have gymnastics experience and are capable of doing more advanced gymnastics. We will work on core strength, advanced tumbling, bigger swings, and more body awareness.',
'["Floor: Roundoff Back handsprings, front flips, back tucks", "Bars: Kips, fly-aways, baby giants", "Vault: Front handspring on vault table", "Beam: Back walkovers, roundoffs dismounts, full turns & leaps"]',
'["10 minute warm up/stretch", "15 minutes 1st event", "15 minutes 2nd event", "10 minute cool down/conditioning"]',
'["Backbend kickover", "Back handspring", "Front handspring", "Cast back hip circle", "Glide", "Tap swing", "Handstand flat back on vault", "Cartwheel & handstand on high beam", "Jumps on beam"]',
'10:1', '90 MIN CLASS', '/classes/level-4', FALSE),

('beginner-boys', 'BOYS BEGINNER', '6yrs and Older', 'This boys only class is geared for boys that have never had any gymnastics experience. We will learn the basics on all six of the boys\' event apparatus, core strength, and body control.',
'["Floor: Forward and backward roll, handstands, cartwheels, bridges", "Pommel horse- swings, support travels, circles on mushroom", "Rings- swings, inverted hang, skin the cat", "Vault- running and jumping, arm swing, jumps", "Parallel bars- under swing, support swings, L-seats", "High bar- tap swings, pirouettes, pullovers, cast"]',
'["10 minute warm up/stretch", "15 minutes 1st event", "15 minutes 2nd event", "10 minute cool down/conditioning"]',
'[]',
'8:1', '50 MIN CLASS', '/classes/beginner-boys', FALSE),

('advanced-boys', 'BOYS ADVANCED', '6yrs and Older', 'This class is a step up from the boys beginner class. We will continue to work on some basic skills, strength, and body awareness. We will also work on more difficult skills on all six of the boy events while keeping it fun.',
'["Floor: back bends, kickovers, roundoff, handstand", "Pommel horse: leg cuts, circles on mushroom", "Rings: Lseats, bigger swings, flyaways", "Vault: front flips, front handsprings, various jumps", "Parallel bars: upper arm swings, dismounts", "High bar: cast back hip circle, bigger tap swings, cast shoot out"]',
'["10 minute warm up/stretch", "15 minutes 1st event", "15 minutes 2nd event", "10 minute cool down/conditioning"]',
'[]',
'8:1', '50 MIN CLASS', '/classes/advanced-boys', FALSE),

('tumbling', 'TUMBLING CLASSES', '6-12 years', 'In this class we work on basic tumbling to advanced tumbling. There is no previous tumbling experience needed for this class. In addition to tumbling we will work on jumps, strength, and conditioning.',
'["Handstands, round offs, walkovers, aerials, front handsprings, back handsprings, standing back flips", "Tumbling passes: round off back handsprings, back flips, layouts, full twist"]',
'["10 minute warm up/stretch", "5 minutes basic tumbling", "35 minutes open tumbling", "10 minute cool down/conditioning"]',
'[]',
'', '60 MIN CLASS', '/classes/tumbling', FALSE),

('adult-gymnastics', 'ADULT CLASS', '18+ years', 'In these classes, we work on basic tumbling to advanced tumbling. There is no previous tumbling experience needed for this class. Besides tumbling we will work on jumps, strength, and conditioning.',
'[]',
'[]',
'[]',
'', '90 MIN CLASS - $10 drop in', '/classes/adult-gymnastics', FALSE),

('homeschool-classes', 'HOMESCHOOL CLASSES', '6yrs and Older', 'This class is for children with no gymnastics experience. We will work on basic gymnastics skills along with body awareness and physical conditioning.',
'["Floor: Forward and backward rolls, cartwheels, handstands, bridges", "Bars: Pullover with assistance, cast, swings, glides", "Beam: Walking forwards, sideways, backwards, hops, leaps", "Vault: Arm circle, running and jumping, variation of jumps"]',
'["10 minute warm up/stretch", "15 minutes 1st event", "15 minutes 2nd event", "10 minute cool down/conditioning"]',
'[]',
'', '90 MIN CLASS - $10 drop in', '/classes/homeschool-classes', FALSE);