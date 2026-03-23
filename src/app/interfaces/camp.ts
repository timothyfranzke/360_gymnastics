// Camp interfaces for 360 Gym Management System

export interface Camp {
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

// Calendar-based camp/clinic from Jackrabbit
export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  spotsAvailable: number;
  backgroundColor: string;
  registrationUrl: string;
  dates: string[];
  type: 'camp' | 'clinic' | 'event';
  dateRange: string;
  firstDate: string | null;
}

export interface CampsAndClinicsResponse {
  camps: CalendarEvent[];
  clinics: CalendarEvent[];
  all: CalendarEvent[];
  monthsSearched: number;
}

export interface CreateCampRequest {
  title: string;
  date: string;
  cost: number;
  description: string;
  time: string;
  registration_link: string;
}

export interface UpdateCampRequest extends Partial<CreateCampRequest> {
  is_active?: boolean;
}

export interface CampFilters {
  search?: string;
  date_from?: string;
  date_to?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'date' | 'title' | 'cost' | 'created_at';
  sort_order?: 'ASC' | 'DESC';
}

export interface CampStats {
  total: number;
  active: number;
  upcoming: number;
  this_month: number;
}