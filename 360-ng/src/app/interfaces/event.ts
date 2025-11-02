export interface Event {
  id: number;
  title: string;
  date: string; // ISO date string
  cost: number; // Cost in dollars
  description: string;
  time: string; // Time format (e.g., "9:00 AM - 3:00 PM")
  registration_link: string; // URL for registration
  is_active: boolean;
  created_at: string;
  updated_at: string;
}