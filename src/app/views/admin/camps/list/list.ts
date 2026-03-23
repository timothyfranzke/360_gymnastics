import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CampsService } from '../../../../services/camps.service';
import { AuthService } from '../../../../services/auth.service';
import {
  Camp,
  CampFilters,
  CampStats
} from '../../../../interfaces/camp';
import { PaginatedResponse, User } from '../../../../interfaces/api';

@Component({
  selector: 'app-camps-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class CampsList implements OnInit, OnDestroy {
  camps: Camp[] = [];
  isLoading = true;
  error: string | null = null;
  currentUser: User | null = null;
  stats: CampStats | null = null;
  
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
    private campsService: CampsService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      date_from: [''],
      date_to: [''],
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
        this.loadCamps();
      });

    this.loadCamps();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCamps(): void {
    this.isLoading = true;
    this.error = null;

    const filters: CampFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort_by: 'date',
      sort_order: 'DESC'
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof CampFilters] === '') {
        delete filters[key as keyof CampFilters];
      }
    });

    this.campsService.getCamps(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Camp>) => {
          this.camps = response.data;
          this.currentPage = response.pagination.current_page;
          this.totalPages = response.pagination.total_pages;
          this.totalItems = response.pagination.total_items;
          this.itemsPerPage = response.pagination.items_per_page;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load camps', error);
          this.error = error.message || 'Failed to load camps';
          this.isLoading = false;
        }
      });
  }

  loadStats(): void {
    this.campsService.getCampStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Failed to load camp stats', error);
        }
      });
  }

  deleteCamp(camp: Camp): void {
    if (!confirm(`Are you sure you want to delete "${camp.title}"?`)) {
      return;
    }

    this.campsService.deleteCamp(camp.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadCamps();
          this.loadStats();
        },
        error: (error) => {
          console.error('Failed to delete camp', error);
          alert('Failed to delete camp: ' + error.message);
        }
      });
  }

  toggleActiveStatus(camp: Camp): void {
    const newStatus = !camp.is_active;
    
    this.campsService.updateCamp(camp.id, { is_active: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          camp.is_active = newStatus;
          this.loadStats();
        },
        error: (error) => {
          console.error('Failed to update camp status', error);
          alert('Failed to update status: ' + error.message);
        }
      });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCamps();
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  isCampUpcoming(camp: Camp): boolean {
    const campDate = new Date(camp.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return campDate >= today;
  }

  isCampActive(camp: Camp): boolean {
    return camp.is_active && this.isCampUpcoming(camp);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadCamps();
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