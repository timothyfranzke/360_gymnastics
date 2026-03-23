import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarService } from '../../services/calendar.service';
import { CalendarResponse } from '../../interfaces/calendar';

@Component({
  selector: 'app-calendar-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calendar-test">
      <h2>Calendar API Test</h2>
      
      <div class="controls">
        <button (click)="loadCurrentMonth()">Load Current Month</button>
        <button (click)="loadNextMonth()">Load Next Month</button>
        <button (click)="loadPreviousMonth()">Load Previous Month</button>
        
        <select [(ngModel)]="selectedFilter" (change)="onFilterChange()">
          <option value="">All Events</option>
          <option value="Open">Open Events</option>
          <option value="Booked">Booked Events</option>
          <option value="Hold">Hold Events</option>
          <option value="Unavailable">Unavailable Events</option>
          <option value="Notice">Notices</option>
        </select>
      </div>

      <div class="loading" *ngIf="loading">Loading calendar...</div>
      
      <div class="error" *ngIf="error">
        Error: {{ error }}
      </div>

      <div class="calendar" *ngIf="calendarData && !loading">
        <h3>{{ calendarData.calendar.month }} {{ calendarData.calendar.year }}</h3>
        
        <div class="calendar-grid">
          <div class="day-header">Sun</div>
          <div class="day-header">Mon</div>
          <div class="day-header">Tue</div>
          <div class="day-header">Wed</div>
          <div class="day-header">Thu</div>
          <div class="day-header">Fri</div>
          <div class="day-header">Sat</div>
          
          <ng-container *ngFor="let week of calendarData.calendar.weeks">
            <div 
              *ngFor="let day of week.days" 
              class="calendar-day"
              [class.in-month]="day.isInMonth"
              [class.today]="day.isToday"
              [class.not-in-month]="!day.isInMonth">
              
              <div class="day-number">{{ day.day }}</div>
              
              <div class="events">
                <div 
                  *ngFor="let event of day.events"
                  class="event"
                  [style.backgroundColor]="event.backgroundColor"
                  [style.color]="event.color"
                  (click)="openRegistration(event)">
                  <div class="event-time">{{ event.time }}</div>
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-spots">({{ event.spotsAvailable }})</div>
                </div>
              </div>
            </div>
          </ng-container>
        </div>
      </div>

      <div class="debug" *ngIf="calendarData && showDebug">
        <h4>Debug Info</h4>
        <pre>{{ calendarData | json }}</pre>
      </div>
      
      <button (click)="toggleDebug()">Toggle Debug</button>
    </div>
  `,
  styles: [`
    .calendar-test {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .controls {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .controls button {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .controls button:hover {
      background: #0056b3;
    }

    .controls select {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .loading, .error {
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }

    .error {
      color: red;
      background: #ffebee;
      border: 1px solid #f44336;
      border-radius: 4px;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      background: #e0e0e0;
      border: 1px solid #ccc;
    }

    .day-header {
      background: #f5f5f5;
      padding: 10px;
      text-align: center;
      font-weight: bold;
      border-bottom: 1px solid #ccc;
    }

    .calendar-day {
      background: white;
      min-height: 100px;
      padding: 5px;
      position: relative;
    }

    .calendar-day.not-in-month {
      background: #f9f9f9;
      color: #ccc;
    }

    .calendar-day.today {
      background: #e3f2fd;
    }

    .day-number {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .events {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .event {
      padding: 2px 4px;
      border-radius: 2px;
      font-size: 10px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .event:hover {
      opacity: 0.8;
    }

    .event-time {
      font-weight: bold;
    }

    .event-title {
      margin: 1px 0;
    }

    .event-spots {
      font-style: italic;
    }

    .debug {
      margin-top: 20px;
      padding: 20px;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .debug pre {
      max-height: 400px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
  `]
})
export class CalendarTestComponent implements OnInit {
  calendarData: CalendarResponse | null = null;
  loading = false;
  error = '';
  showDebug = false;
  selectedFilter = '';
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  constructor(private calendarService: CalendarService) {}

  ngOnInit() {
    this.loadCurrentMonth();
  }

  loadCurrentMonth() {
    const now = new Date();
    this.currentMonth = now.getMonth() + 1;
    this.currentYear = now.getFullYear();
    this.loadCalendar();
  }

  loadNextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    }
    this.loadCalendar();
  }

  loadPreviousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }
    this.loadCalendar();
  }

  onFilterChange() {
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
          this.error = err.message;
          this.loading = false;
        }
      });
  }

  openRegistration(event: any) {
    if (event.registrationUrl) {
      window.open(event.registrationUrl, '_blank');
    }
  }

  toggleDebug() {
    this.showDebug = !this.showDebug;
  }
}