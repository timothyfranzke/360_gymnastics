import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CampsService } from '../../services/camps.service';
import { Camp } from '../../interfaces/camp';

@Component({
  selector: 'app-camps',
  imports: [CommonModule],
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
  camps: Camp[] = [];
  loading = true;
  error: string | null = null;

  constructor(private campsService: CampsService) { }

  ngOnInit(): void {
    this.loadCamps();
  }

  private loadCamps(): void {
    this.loading = true;
    this.error = null;

    this.campsService.getActiveCamps().subscribe({
      next: (camps) => {
        this.camps = camps;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading camps:', error);
        this.error = 'Failed to load camps. Please try again later.';
        this.loading = false;
      }
    });
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format cost for display
   */
  formatCost(cost: number): string {
    return `$${cost.toFixed(2)}`;
  }

  /**
   * Open registration link in new tab
   */
  openRegistration(registrationLink: string): void {
    window.open(registrationLink, '_blank', 'noopener,noreferrer');
  }

  /**
   * Retry loading camps
   */
  retryLoad(): void {
    this.loadCamps();
  }

  /**
   * Check if camp is upcoming (future date)
   */
  isUpcoming(dateString: string): boolean {
    const campDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return campDate >= today;
  }

  /**
   * Get camp status badge
   */
  getCampStatus(dateString: string): string {
    return this.isUpcoming(dateString) ? 'Upcoming' : 'Past';
  }

  /**
   * Get camp status class
   */
  getCampStatusClass(dateString: string): string {
    return this.isUpcoming(dateString) ? 'status-upcoming' : 'status-past';
  }
}
