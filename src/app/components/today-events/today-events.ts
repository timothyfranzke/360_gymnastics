import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService } from '../../services/calendar.service';
import { CalendarEvent } from '../../interfaces/calendar';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-today-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './today-events.html',
  styleUrls: ['./today-events.scss']
})
export class TodayEventsComponent implements OnInit {
  todayEvents: CalendarEvent[] = [];
  loading = true;
  error = '';
  currentDate = new Date();

  constructor(private calendarService: CalendarService) {}

  get upcomingEvents(): CalendarEvent[] {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    return this.todayEvents.filter(event => {
      if (!event.time) {
        // All-day events: show until end of day
        return true;
      }

      const eventHour = this.parseEventHour(event.time);
      if (eventHour === null) return true; // Can't parse, show it

      // Hide events that have already started
      return eventHour > currentHour || (eventHour === currentHour && currentMinutes < 30);
    });
  }

  get hasUpcomingEvents(): boolean {
    return !this.loading && !this.error && this.upcomingEvents.length > 0;
  }

  private parseEventHour(time: string): number | null {
    // Parse time format like "10a", "2p", "12p"
    const match = time.match(/^(\d{1,2})(a|p)$/i);
    if (!match) return null;

    let hour = parseInt(match[1], 10);
    const isPM = match[2].toLowerCase() === 'p';

    if (isPM && hour !== 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }

    return hour;
  }

  ngOnInit() {
    this.loadTodayEvents();
  }

  loadTodayEvents() {
    this.loading = true;
    // We get the current month's calendar, then filter for today
    this.calendarService.getCurrentMonthCalendar()
      .subscribe({
        next: (response) => {
          this.processCalendarData(response.calendar.weeks);
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load today events', err);
          this.error = 'Could not load today\'s schedule.';
          this.loading = false;
        }
      });
  }

  private processCalendarData(weeks: any[]) {
    const todayStr = this.currentDate.toDateString();
    
    this.todayEvents = [];
    
    // Iterate through weeks and days to find today
    // Note: Ideally the service would provide a 'getEventsForDate' method, 
    // but filtering the loaded month is efficient enough for client-side.
    for (const week of weeks) {
      for (const day of week.days) {
        if (day.isToday) {
           this.todayEvents = day.events || [];
           return; // Found today, stop searching
        }
        
        // Fallback: compare dates if isToday flag isn't reliable from all sources
        // The service logic for isToday is robust, but double check date object if needed
        if (day.date) {
            const d = new Date(day.date);
            if (d.toDateString() === todayStr) {
                 this.todayEvents = day.events || [];
                 return;
            }
        }
      }
    }
  }

  openEventRegistration(event: CalendarEvent) {
    if (event.registrationUrl) {
      window.open(event.registrationUrl, '_blank', 'width=800,height=600');
    }
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
}
