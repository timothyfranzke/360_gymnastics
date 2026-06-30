-- Migration: Create party_page_settings table
-- Description: Stores editable content for the parties page (intro, footer note, packages)

CREATE TABLE IF NOT EXISTS party_page_settings (
    id INT PRIMARY KEY DEFAULT 1,
    intro TEXT NOT NULL,
    footer_note TEXT NOT NULL,
    packages JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT party_settings_single_row CHECK (id = 1)
);

-- Insert default content seeded from the current hardcoded parties page
INSERT INTO party_page_settings (id, intro, footer_note, packages) VALUES (
    1,
    '360 Gymnastics is a great place to have your next birthday party, school field trip, scouting event, or any other special event!',
    '',
    '[
        {
            "id": 1,
            "name": "Private Party",
            "price": "$200 (for 15 kids including birthday child)",
            "description": "Our parties are structured and scheduled outside of open gym and class times so your kids get to take over the gym! You have a gym instructor leading your child and friends through an obstacle course, games, assistance on the equipment, and of course, free time!",
            "bullets": [
                "30 minutes in the party room",
                "60 minutes in the gym with an instructor",
                "Additional children – $10 each",
                "Saturday – after 3pm",
                "Sunday – all day"
            ],
            "display_order": 1,
            "active": true
        },
        {
            "id": 2,
            "name": "Open Gym Party",
            "price": "$150 (for 15 kids including birthday child)",
            "description": "Your party takes place during our regularly scheduled open gym time. The children have access to all of the equipment to play and have fun. This includes 30 minutes in the party room prior to open gym.",
            "bullets": [
                "30 minutes in the party room",
                "60 minutes in the gym during open gym",
                "Additional children – $8 each",
                "Saturday – 2-3:30 pm"
            ],
            "display_order": 2,
            "active": true
        },
        {
            "id": 3,
            "name": "Groups/Field Trips",
            "price": "Contact for pricing",
            "description": "Perfect for schools, daycares, scout troops, and other organized groups. Field trips include structured activities led by our staff, safety briefing, and age-appropriate challenges. Can accommodate groups of 10-50 children with advance booking.",
            "bullets": [],
            "display_order": 3,
            "active": true
        }
    ]'
);
