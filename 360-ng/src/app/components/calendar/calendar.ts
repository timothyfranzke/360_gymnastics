import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../services/calendar.service';
import { CalendarResponse, CalendarEvent } from '../../interfaces/calendar';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss']
})
export class CalendarComponent implements OnInit {
  @Input() showHeader: boolean = true;
  @Input() compact: boolean = false;
  @Input() maxEventsPerDay: number = 3;

  calendarData: CalendarResponse | null = null;
  loading = false;
  error = '';
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  selectedFilter = '';

  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  readonly dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private calendarService: CalendarService) {}

  ngOnInit() {
    this.loadCalendar();
  }

  loadCalendar() {
    this.loading = true;
    this.error = '';

    this.calendarService.getCalendar(this.currentMonth, this.currentYear, this.selectedFilter)
      .subscribe({
        next: (data) => {
          this.calendarData = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load calendar: ' + err.message;
          this.loading = false;
        }
      });
  }

  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }
    this.loadCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    }
    this.loadCalendar();
  }

  goToToday() {
    const now = new Date();
    this.currentMonth = now.getMonth() + 1;
    this.currentYear = now.getFullYear();
    this.loadCalendar();
  }

  onFilterChange(filter: string) {
    this.selectedFilter = filter;
    this.loadCalendar();
  }

  openEventRegistration(event: CalendarEvent) {
    if (event.registrationUrl) {
      window.open(event.registrationUrl, '_blank', 'width=800,height=600');
    }
  }

  getVisibleEvents(events: CalendarEvent[]): CalendarEvent[] {
    if (this.compact && events.length > this.maxEventsPerDay) {
      return events.slice(0, this.maxEventsPerDay);
    }
    return events;
  }

  getHiddenEventsCount(events: CalendarEvent[]): number {
    if (this.compact && events.length > this.maxEventsPerDay) {
      return events.length - this.maxEventsPerDay;
    }
    return 0;
  }

  getEventTypeClass(event: CalendarEvent): string {
    const title = event.title.toLowerCase();
    if (title.includes('closed')) return 'event-closed';
    if (title.includes('open gym')) return 'event-open-gym';
    if (title.includes('camp')) return 'event-camp';
    if (title.includes('clinic')) return 'event-clinic';
    if (title.includes('party')) return 'event-party';
    return 'event-default';
  }

  formatTime(time: string): string {
    if (!time) return '';
    return time.replace(/(\d{1,2}:\d{2})([ap])/i, '$1$2m');
  }

  isEventAvailable(event: CalendarEvent): boolean {
    return event.spotsAvailable > 0 && !event.title.toLowerCase().includes('closed');
  }

  getCurrentMonthName(): string {
    return this.monthNames[this.currentMonth - 1] || '';
  }

  refresh() {
    this.loadCalendar();
  }

  hasFilters(): boolean {
    return !!(this.calendarData?.filters && this.calendarData.filters.length > 0);
  }
}