import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CampsService } from '../../services/camps.service';
import { CalendarEvent } from '../../interfaces/camp';
import { ViewHeader } from '../../components/view-header/view-header';

@Component({
  selector: 'app-camps',
  imports: [CommonModule, RouterLink, ViewHeader],
  templateUrl: './camps.html',
  styleUrl: './camps.scss',
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('fadeInUpDelay', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms 200ms ease-out')
      ])
    ]),
    trigger('staggerCamps', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms 300ms ease-out')
      ])
    ])
  ]
})
export class Camps implements OnInit {
  animationState = 'in';
  camps: CalendarEvent[] = [];
  clinics: CalendarEvent[] = [];
  loading = true;
  error: string | null = null;
  activeTab: 'camps' | 'clinics' = 'camps';

  constructor(private campsService: CampsService) { }

  ngOnInit(): void {
    this.loadCampsAndClinics();
  }

  private loadCampsAndClinics(): void {
    this.loading = true;
    this.error = null;

    this.campsService.getCampsAndClinicsFromCalendar(6).subscribe({
      next: (response) => {
        this.camps = response.camps;
        this.clinics = response.clinics;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading camps:', error);
        this.error = 'Failed to load camps and clinics. Please try again later.';
        this.loading = false;
      }
    });
  }

  /**
   * Switch between camps and clinics tabs
   */
  switchTab(tab: 'camps' | 'clinics'): void {
    this.activeTab = tab;
  }

  /**
   * Get current items based on active tab
   */
  get currentItems(): CalendarEvent[] {
    return this.activeTab === 'camps' ? this.camps : this.clinics;
  }

  /**
   * Open registration link in new tab
   */
  openRegistration(registrationUrl: string): void {
    window.open(registrationUrl, '_blank', 'noopener,noreferrer');
  }

  /**
   * Retry loading
   */
  retryLoad(): void {
    this.loadCampsAndClinics();
  }

  /**
   * Check if event is upcoming (future date)
   */
  isUpcoming(firstDate: string | null): boolean {
    if (!firstDate) return false;
    const eventDate = new Date(firstDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }

  /**
   * Get spots status text
   */
  getSpotsStatus(spots: number): string {
    if (spots === 0) return 'Full';
    if (spots <= 5) return `${spots} spots left`;
    return `${spots} spots available`;
  }

  /**
   * Get spots status class
   */
  getSpotsClass(spots: number): string {
    if (spots === 0) return 'text-red-600 bg-red-100';
    if (spots <= 5) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  }

  /**
   * Get gradient class based on event type and color
   */
  getGradientClass(event: CalendarEvent): string {
    if (event.type === 'camp') {
      return 'from-blue-500 to-purple-600';
    }
    return 'from-orange-500 to-pink-600';
  }
}
