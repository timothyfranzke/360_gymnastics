import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import {
  Announcement,
  AnnouncementFilters,
  PaginatedResponse,
  User
} from '../../../../interfaces/api';

@Component({
  selector: 'app-announcement-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class AnnouncementList implements OnInit, OnDestroy {
  announcements: Announcement[] = [];
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
      search: [''],
      type: [''],
      priority: [''],
      is_active: ['']
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
        this.loadAnnouncements();
      });

    this.loadAnnouncements();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.error = null;

    const filters: AnnouncementFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort_by: 'created_at',
      sort_order: 'DESC'
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof AnnouncementFilters] === '') {
        delete filters[key as keyof AnnouncementFilters];
      }
    });

    this.apiService.getAnnouncements(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Announcement>) => {
          this.announcements = response.data;
          this.currentPage = response.pagination.current_page;
          this.totalPages = response.pagination.total_pages;
          this.totalItems = response.pagination.total_items;
          this.itemsPerPage = response.pagination.items_per_page;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load announcements', error);
          this.error = error.message || 'Failed to load announcements';
          this.isLoading = false;
        }
      });
  }

  deleteAnnouncement(announcement: Announcement): void {
    if (!confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
      return;
    }

    this.apiService.deleteAnnouncement(announcement.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadAnnouncements();
        },
        error: (error) => {
          console.error('Failed to delete announcement', error);
          alert('Failed to delete announcement: ' + error.message);
        }
      });
  }

  toggleActiveStatus(announcement: Announcement): void {
    const newStatus = !announcement.is_active;
    
    this.apiService.updateAnnouncement(announcement.id, { is_active: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          announcement.is_active = newStatus;
        },
        error: (error) => {
          console.error('Failed to update announcement status', error);
          alert('Failed to update status: ' + error.message);
        }
      });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAnnouncements();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // Helper methods for template
  getPriorityColor(priority: string): string {
    const colors = {
      low: 'gray',
      medium: 'yellow',
      high: 'orange',
      critical: 'red'
    };
    return colors[priority as keyof typeof colors] || 'gray';
  }

  getTypeColor(type: string): string {
    const colors = {
      general: 'blue',
      class: 'green',
      maintenance: 'red'
    };
    return colors[type as keyof typeof colors] || 'gray';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  isAnnouncementCurrentlyActive(announcement: Announcement): boolean {
    const now = new Date();
    const startDate = new Date(announcement.start_date);
    const endDate = new Date(announcement.end_date);
    return announcement.is_active && startDate <= now && endDate >= now;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadAnnouncements();
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
}