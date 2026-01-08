import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CalendarEvent, CalendarDay, CalendarWeek, CalendarMonth, CalendarResponse, CalendarFilter } from '../interfaces/calendar';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly API_BASE = environment.api.baseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get calendar data for a specific month and year
   */
  getCalendar(month?: number, year?: number, status?: string): Observable<CalendarResponse> {
    let params = new HttpParams();
    
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());
    if (status) params = params.set('status', status);

    return this.http.get<any>(`${this.API_BASE}/calendar`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get current month calendar
   */
  getCurrentMonthCalendar(status?: string): Observable<CalendarResponse> {
    const now = new Date();
    return this.getCalendar(now.getMonth() + 1, now.getFullYear(), status);
  }

  /**
   * Parse HTML calendar response from Jackrabbit Class
   */
  parseJackrabbitHtml(html: string): CalendarResponse {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract month and year
    const monthYearText = doc.querySelector('.Month b')?.textContent?.trim() || '';
    const [monthName, yearStr] = monthYearText.split(' ');
    const year = parseInt(yearStr);
    
    // Extract navigation URLs
    const prevLink = doc.querySelector('a[href*="date="]') as HTMLAnchorElement;
    const nextLinks = doc.querySelectorAll('a[href*="date="]');
    const nextLink = nextLinks[nextLinks.length - 1] as HTMLAnchorElement;
    
    const previousMonthUrl = prevLink?.href || '';
    const nextMonthUrl = nextLink?.href || '';

    // Extract filter options
    const filterSelect = doc.querySelector('#CalendarDisplay') as HTMLSelectElement;
    const filters: CalendarFilter[] = [];
    const currentFilter = filterSelect?.value || '';

    if (filterSelect) {
      Array.from(filterSelect.options).forEach(option => {
        filters.push({
          type: option.value as any,
          label: option.textContent?.trim() || ''
        });
      });
    }

    // Parse calendar grid
    const weeks = this.parseCalendarWeeks(doc, year);

    const calendar: CalendarMonth = {
      month: monthName,
      year,
      weeks,
      previousMonthUrl,
      nextMonthUrl
    };

    return {
      calendar,
      filters,
      currentFilter
    };
  }

  /**
   * Parse calendar weeks from the HTML table
   */
  private parseCalendarWeeks(doc: Document, year: number): CalendarWeek[] {
    const weeks: CalendarWeek[] = [];
    const calendarRows = doc.querySelectorAll('.MonthlyCal tr');
    
    // Skip header rows and process day rows
    for (let i = 2; i < calendarRows.length - 1; i++) {
      const row = calendarRows[i];
      const cells = row.querySelectorAll('td');
      
      if (cells.length === 7) {
        const days: CalendarDay[] = [];
        
        cells.forEach((cell, dayIndex) => {
          const day = this.parseCalendarDay(cell, year);
          days.push(day);
        });
        
        weeks.push({ days });
      }
    }
    
    return weeks;
  }

  /**
   * Parse individual calendar day
   */
  private parseCalendarDay(cell: Element, year: number): CalendarDay {
    const dayNumber = this.extractDayNumber(cell);
    const isInMonth = cell.classList.contains('MonthlyCal_InMonth') || cell.classList.contains('MonthlyCal_Today');
    const isToday = cell.classList.contains('MonthlyCal_Today');
    
    // Create date (approximate - would need more context for exact month)
    const today = new Date();
    const month = today.getMonth(); // This is approximate - in real implementation you'd pass this in
    const date = new Date(year, month, dayNumber);
    
    const events = this.parseEvents(cell, date);

    return {
      date,
      day: dayNumber,
      isInMonth,
      isToday,
      events
    };
  }

  /**
   * Extract day number from calendar cell
   */
  private extractDayNumber(cell: Element): number {
    const smallElement = cell.querySelector('small');
    if (smallElement && smallElement.textContent) {
      return parseInt(smallElement.textContent.trim());
    }
    return 0;
  }

  /**
   * Parse events from a calendar cell
   */
  private parseEvents(cell: Element, date: Date): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const eventElements = cell.querySelectorAll('a[onclick*="openreg"]');
    
    eventElements.forEach(eventEl => {
      const event = this.parseEvent(eventEl as HTMLAnchorElement, date);
      if (event) {
        events.push(event);
      }
    });
    
    return events;
  }

  /**
   * Parse individual event
   */
  private parseEvent(eventElement: HTMLAnchorElement, date: Date): CalendarEvent | null {
    const onclickAttr = eventElement.getAttribute('onclick') || '';
    const eventIdMatch = onclickAttr.match(/openreg\((\d+)\)/);
    const eventId = eventIdMatch ? eventIdMatch[1] : '';
    
    const textContent = eventElement.textContent?.trim() || '';
    const title = this.extractEventTitle(textContent);
    const time = this.extractEventTime(textContent);
    const spotsAvailable = this.extractSpotsAvailable(textContent);
    
    const backgroundColor = eventElement.parentElement?.getAttribute('bgcolor') || '';
    const color = this.getTextColorForBackground(backgroundColor);
    
    const registrationUrl = `https://app.jackrabbitclass.com/regevent.asp?xID=${eventId}&orgid=514082&PortalSession=`;

    if (!eventId || !title) {
      return null;
    }

    return {
      id: eventId,
      title,
      time,
      date,
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      spotsAvailable,
      color,
      backgroundColor,
      registrationUrl,
      isToday: this.isToday(date)
    };
  }

  /**
   * Extract event title from text content
   */
  private extractEventTitle(textContent: string): string {
    // Remove time and spots available, extract the main title
    const timePattern = /^\d{1,2}:\d{2}[ap]\s*/;
    const spotsPattern = /\s*\(\d+\)$/;
    
    let title = textContent.replace(timePattern, '').replace(spotsPattern, '').trim();
    
    // Clean up common prefixes
    if (title.startsWith('- ')) {
      title = title.substring(2);
    }
    
    return title;
  }

  /**
   * Extract event time from text content
   */
  private extractEventTime(textContent: string): string {
    const timeMatch = textContent.match(/(\d{1,2}:\d{2}[ap])/);
    return timeMatch ? timeMatch[1] : '';
  }

  /**
   * Extract spots available from text content
   */
  private extractSpotsAvailable(textContent: string): number {
    const spotsMatch = textContent.match(/\((\d+)\)$/);
    return spotsMatch ? parseInt(spotsMatch[1]) : 0;
  }

  /**
   * Get appropriate text color for background
   */
  private getTextColorForBackground(backgroundColor: string): string {
    // Simple logic - in real app you might want more sophisticated color analysis
    const darkBackgrounds = ['#CC3300', '#333366'];
    const lightBackgrounds = ['#FFCC33', '#ffffcc', '#00CC00', '#FF99FF', '#0099CC', '#FFFF00'];
    
    if (darkBackgrounds.includes(backgroundColor.toUpperCase())) {
      return '#FFFFFF';
    } else if (lightBackgrounds.includes(backgroundColor.toUpperCase())) {
      return '#000000';
    }
    
    return '#000000'; // Default to black text
  }

  /**
   * Check if date is today
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'Failed to fetch calendar data';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Calendar Service Error:', error);
    throw new Error(errorMessage);
  };
}