import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import {
  Staff,
  StaffFilters,
  PaginatedResponse,
  User
} from '../../../../interfaces/api';

@Component({
  selector: 'app-staff-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class StaffList implements OnInit, OnDestroy {
  staff: Staff[] = [];
  isLoading = true;
  error: string | null = null;
  currentUser: User | null = null;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  
  // Filters
  filterForm: FormGroup;

  Math = Math;
  
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Setup filter form changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadStaff();
      });

    this.loadStaff();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStaff(): void {
    this.isLoading = true;
    this.error = null;

    const filters: StaffFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort_by: 'hire_date',
      sort_order: 'DESC'
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof StaffFilters] === '') {
        delete filters[key as keyof StaffFilters];
      }
    });

    this.apiService.getStaff(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Staff>) => {
          console.log(response)
          this.staff = response.data || [];
          this.currentPage = response.pagination?.current_page || 1;
          this.totalPages = response.pagination?.total_pages || 1;
          this.totalItems = response.pagination?.total_items || 0;
          this.itemsPerPage = response.pagination?.items_per_page || 10;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load staff', error);
          this.error = error.message || 'Failed to load staff';
          this.staff = []; // Ensure staff is always an array
          this.isLoading = false;
        }
      });
  }

  
  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadStaff();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // Helper methods for template

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }


  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadStaff();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const end = Math.min(this.totalPages, start + maxPages - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Avatar helper methods
  hasValidAvatar(staff: Staff): boolean {
    return !!(staff.image_url && staff.image_url.trim().length > 0);
  }

  getAvatarThumbnailUrl(staff: Staff): string | null {
    if (!this.hasValidAvatar(staff)) {
      return null;
    }
    
    // Use thumbnail URL if available, otherwise use the main image URL
    return staff.image_thumbnail_url || staff.image_url || null;
  }

  getAvatarFallback(staff: Staff): string {
    const initials = `${staff.first_name.charAt(0)}${staff.last_name.charAt(0)}`;
    return initials.toUpperCase();
  }

  onImageError(event: Event): void {
    // Hide the image when it fails to load
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }
}