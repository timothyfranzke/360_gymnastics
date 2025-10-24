import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { HomepageStaff } from '../../interfaces/api';

@Component({
  selector: 'app-staff-display',
  templateUrl: './staff-display.html',
  styleUrls: ['./staff-display.scss'],
  imports: [CommonModule],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('staggerCards', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('modalBackdrop', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalContent', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95) translateY(-10px)' }))
      ])
    ])
  ]
})
export class StaffDisplay implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  staff: HomepageStaff[] = [];
  loading = true;
  error: string | null = null;
  animationState = 'in';
  
  // Modal state
  isModalOpen = false;
  selectedStaff: HomepageStaff | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Ensure body scroll is restored if component is destroyed while modal is open
    if (this.isModalOpen) {
      document.body.style.overflow = 'auto';
    }
  }

  private loadStaff(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getHomepageStaff()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (staff) => {
          this.staff = staff;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading staff:', error);
          this.error = 'Failed to load staff information. Please try again later.';
          this.loading = false;
        }
      });
  }

  getStaffFullName(staff: HomepageStaff): string {
    return `${staff.first_name} ${staff.last_name}`;
  }

  getYearsText(years: number): string {
    if (years === 1) {
      return '1 year with us';
    }
    return `${years} years with us`;
  }

  getAvatarFallback(staff: HomepageStaff): string {
    const initials = `${staff.first_name.charAt(0)}${staff.last_name.charAt(0)}`;
    return initials.toUpperCase();
  }

  hasValidAvatar(staff: HomepageStaff): boolean {
    return !!(staff.image_thumbnail_url && staff.image_thumbnail_url.trim().length > 0);
  }

  getAvatarThumbnailUrl(staff: HomepageStaff): string | null {
    if (!this.hasValidAvatar(staff)) {
      return null;
    }
    
    // The API already provides the correct thumbnail URL
    return staff.image_thumbnail_url!;
  }

  retryLoad(): void {
    this.loadStaff();
  }

  trackByStaffId(_index: number, staff: HomepageStaff): number {
    return staff.id;
  }

  onImageError(event: Event): void {
    // Hide the image when it fails to load
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  // Modal methods
  openStaffModal(staff: HomepageStaff): void {
    this.selectedStaff = staff;
    this.isModalOpen = true;
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeStaffModal(): void {
    this.isModalOpen = false;
    this.selectedStaff = null;
    // Restore body scrolling
    document.body.style.overflow = 'auto';
  }

  onModalBackdropClick(event: Event): void {
    // Close modal when clicking the backdrop
    if (event.target === event.currentTarget) {
      this.closeStaffModal();
    }
  }

  onModalKeydown(event: KeyboardEvent): void {
    // Close modal when pressing Escape
    if (event.key === 'Escape') {
      this.closeStaffModal();
    }
  }

  getFullImageUrl(staff: HomepageStaff): string | null {
    if (!staff.image_url) {
      return null;
    }
    return staff.image_url;
  }
}