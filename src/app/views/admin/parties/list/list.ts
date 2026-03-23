import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { BadgeNotificationsService } from '../../../../services/badge-notifications';
import { PartyRequest, PartyRequestFilters } from '../../../../interfaces/party';
import { PaginatedResponse, User } from '../../../../interfaces/api';

@Component({
  selector: 'app-party-request-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class PartyRequestList implements OnInit, OnDestroy {
  partyRequests: PartyRequest[] = [];
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
    private fb: FormBuilder,
    private badgeNotificationsService: BadgeNotificationsService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      party_type: [''],
      date_from: [''],
      date_to: ['']
    });
  }

  ngOnInit(): void {
    // Mark parties as viewed when user visits this page
    this.badgeNotificationsService.markPartiesAsViewed();

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
        this.loadPartyRequests();
      });

    this.loadPartyRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPartyRequests(): void {
    this.isLoading = true;
    this.error = null;

    const filters: PartyRequestFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort_by: 'submitted_at',
      sort_order: 'DESC'
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof PartyRequestFilters] === '') {
        delete filters[key as keyof PartyRequestFilters];
      }
    });

    this.apiService.getPartyRequests(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<PartyRequest>) => {
          this.partyRequests = response.data;
          this.currentPage = response.pagination.current_page;
          this.totalPages = response.pagination.total_pages;
          this.totalItems = response.pagination.total_items;
          this.itemsPerPage = response.pagination.items_per_page;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load party requests', error);
          this.error = error.message || 'Failed to load party requests';
          this.isLoading = false;
        }
      });
  }

  updateStatus(partyRequest: PartyRequest, newStatus: string): void {
    if (!confirm(`Are you sure you want to mark this party request as "${newStatus}"?`)) {
      return;
    }

    this.apiService.updatePartyStatus(partyRequest.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          partyRequest.status = newStatus as any;
          partyRequest.updated_at = new Date().toISOString();
        },
        error: (error) => {
          console.error('Failed to update party request status', error);
          alert('Failed to update status: ' + error.message);
        }
      });
  }

  deletePartyRequest(partyRequest: PartyRequest): void {
    if (!confirm(`Are you sure you want to delete the party request for "${partyRequest.child_name}"?`)) {
      return;
    }

    this.apiService.deletePartyRequest(partyRequest.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadPartyRequests();
        },
        error: (error) => {
          console.error('Failed to delete party request', error);
          alert('Failed to delete party request: ' + error.message);
        }
      });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPartyRequests();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // Helper methods for template
  getStatusColor(status: string): string {
    const colors = {
      pending: 'yellow',
      contacted: 'blue',
      confirmed: 'green',
      cancelled: 'red'
    };
    return colors[status as keyof typeof colors] || 'gray';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  isUpcoming(requestedDate: string): boolean {
    return new Date(requestedDate) >= new Date();
  }

  isPast(requestedDate: string): boolean {
    return new Date(requestedDate) < new Date();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadPartyRequests();
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