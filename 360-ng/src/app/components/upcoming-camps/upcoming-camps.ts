import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CampsService } from '../../services/camps.service';
import { CalendarEvent } from '../../interfaces/camp';

@Component({
  selector: 'app-upcoming-camps',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './upcoming-camps.html',
  styleUrls: ['./upcoming-camps.scss']
})
export class UpcomingCampsComponent implements OnInit {
  @Input() limit: number = 6;
  @Input() showCamps: boolean = true;
  @Input() showClinics: boolean = true;

  camps: CalendarEvent[] = [];
  clinics: CalendarEvent[] = [];
  loading = true;
  error = '';

  constructor(private campsService: CampsService) {}

  ngOnInit() {
    this.loadCampsAndClinics();
  }

  get allEvents(): CalendarEvent[] {
    let events: CalendarEvent[] = [];
    if (this.showCamps) events = [...events, ...this.camps];
    if (this.showClinics) events = [...events, ...this.clinics];

    // Sort by first date and limit
    return events
      .sort((a, b) => {
        const dateA = a.firstDate || '9999-99-99';
        const dateB = b.firstDate || '9999-99-99';
        return dateA.localeCompare(dateB);
      })
      .slice(0, this.limit);
  }

  get hasEvents(): boolean {
    return !this.loading && !this.error && this.allEvents.length > 0;
  }

  loadCampsAndClinics() {
    this.loading = true;
    this.campsService.getCampsAndClinicsFromCalendar(4).subscribe({
      next: (response) => {
        this.camps = response.camps;
        this.clinics = response.clinics;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load camps/clinics', err);
        this.error = 'Could not load upcoming programs.';
        this.loading = false;
      }
    });
  }

  openEventRegistration(event: CalendarEvent) {
    if (event.registrationUrl) {
      window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
    }
  }

  getEventTypeClass(event: CalendarEvent): string {
    return event.type === 'camp' ? 'event-camp' : 'event-clinic';
  }

  getEventGradient(event: CalendarEvent): string {
    return event.type === 'camp'
      ? 'from-blue-500 to-purple-600'
      : 'from-orange-500 to-pink-500';
  }

  getEventIcon(event: CalendarEvent): string {
    return event.type === 'camp' ? 'camp' : 'clinic';
  }

  getSpotsClass(spots: number): string {
    if (spots === 0) return 'bg-red-100 text-red-800';
    if (spots <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  getSpotsText(spots: number): string {
    if (spots === 0) return 'Sold Out';
    if (spots <= 5) return `${spots} spots left`;
    return `${spots} spots`;
  }
}
