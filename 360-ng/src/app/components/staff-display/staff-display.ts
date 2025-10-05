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
    ])
  ]
})
export class StaffDisplay implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  staff: HomepageStaff[] = [];
  loading = true;
  error: string | null = null;
  animationState = 'in';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    return !!(staff.image_url && staff.image_url.trim().length > 0);
  }

  getAvatarThumbnailUrl(staff: HomepageStaff): string | null {
    if (!this.hasValidAvatar(staff)) {
      return null;
    }
    
    // If it's a local file, use the thumbnail version for better performance
    if (staff.image_url!.includes('/api/v1/files/staff/')) {
      return staff.image_url!.replace('/files/staff/', '/files/staff/thumbnails/');
    }
    
    // For external URLs, use the original URL
    return staff.image_url!;
  }

  retryLoad(): void {
    this.loadStaff();
  }

  trackByStaffId(index: number, staff: HomepageStaff): number {
    return staff.id;
  }

  onImageError(event: Event): void {
    // Hide the image when it fails to load
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }
}