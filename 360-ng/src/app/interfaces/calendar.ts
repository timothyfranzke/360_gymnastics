export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: Date;
  day: number;
  month: number;
  year: number;
  spotsAvailable: number;
  color: string;
  backgroundColor: string;
  registrationUrl: string;
  isToday: boolean;
}

export interface CalendarDay {
  date: Date;
  day: number;
  isInMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export interface CalendarMonth {
  month: string;
  year: number;
  weeks: CalendarWeek[];
  previousMonthUrl: string;
  nextMonthUrl: string;
}

export interface CalendarFilter {
  type: 'Open' | 'All' | 'Booked' | 'Hold' | 'Unavailable' | 'Notice' | '';
  label: string;
}

export interface CalendarResponse {
  calendar: CalendarMonth;
  filters: CalendarFilter[];
  currentFilter: string;
}