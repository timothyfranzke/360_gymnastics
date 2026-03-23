import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { Staff, User } from '../../../../interfaces/api';

@Component({
  selector: 'app-staff-detail',
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss'],
  imports: [CommonModule, RouterLink]
})
export class StaffDetail implements OnInit, OnDestroy {
  staff: Staff | null = null;
  currentUser: User | null = null;
  isLoading = true;
  error: string | null = null;
  staffId: number;
  
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.staffId = Number(this.route.snapshot.params['id']);
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.loadStaffMember();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStaffMember(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService.getStaffMember(this.staffId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (staff: Staff) => {
          this.staff = staff;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load staff member', error);
          this.error = error.message || 'Failed to load staff member';
          this.isLoading = false;
        }
      });
  }

  editStaff(): void {
    this.router.navigate(['/admin/staff', this.staffId, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/admin/staff']);
  }

  deleteStaff(): void {
    if (!this.staff) return;

    const message = `Are you sure you want to delete ${this.staff.first_name} ${this.staff.last_name}? This action cannot be undone.`;

    if (!confirm(message)) {
      return;
    }

    this.apiService.deleteStaff(this.staff.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/staff']);
        },
        error: (error) => {
          console.error('Failed to delete staff member', error);
          alert('Failed to delete staff member: ' + error.message);
        }
      });
  }

  // Helper methods for template

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  getYearsOfService(): string {
    if (!this.staff) return '';
    
    const hireDate = new Date(this.staff.hire_date);
    const today = new Date();
    const years = today.getFullYear() - hireDate.getFullYear();
    const months = today.getMonth() - hireDate.getMonth();
    
    let totalMonths = years * 12 + months;
    if (today.getDate() < hireDate.getDate()) {
      totalMonths--;
    }

    if (totalMonths < 1) {
      return 'Less than 1 month';
    } else if (totalMonths < 12) {
      return `${totalMonths} month${totalMonths === 1 ? '' : 's'}`;
    } else {
      const fullYears = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      
      if (remainingMonths === 0) {
        return `${fullYears} year${fullYears === 1 ? '' : 's'}`;
      } else {
        return `${fullYears} year${fullYears === 1 ? '' : 's'} and ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
      }
    }
  }

  canEditStaff(): boolean {
    return this.currentUser?.role === 'admin';
  }

  canDeleteStaff(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // Avatar helper methods
  hasValidAvatar(): boolean {
    return !!(this.staff?.image_url && this.staff.image_url.trim().length > 0);
  }

  getAvatarUrl(): string | null {
    if (!this.hasValidAvatar()) {
      return null;
    }
    
    // For detail view, use the original image URL for better quality
    return this.staff!.image_url!;
  }

  getAvatarFallback(): string {
    if (!this.staff) return '';
    const initials = `${this.staff.first_name.charAt(0)}${this.staff.last_name.charAt(0)}`;
    return initials.toUpperCase();
  }

  onImageError(event: Event): void {
    // Hide the image when it fails to load
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }
}