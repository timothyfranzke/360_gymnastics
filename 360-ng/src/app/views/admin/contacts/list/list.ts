import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ContactsService } from '../../../../services/contacts';
import { AuthService } from '../../../../services/auth.service';
import { BadgeNotificationsService } from '../../../../services/badge-notifications';

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  status: 'new' | 'read' | 'responded';
  submitted_at: string;
  created_at: string;
  updated_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ContactFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedContactResponse {
  data: ContactSubmission[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

@Component({
  selector: 'app-contacts-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class ContactsListComponent implements OnInit, OnDestroy {
  contacts: ContactSubmission[] = [];
  isLoading = true;
  error: string | null = null;
  notification: { message: string; type: 'success' | 'error' } | null = null;
  
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
    private contactsService: ContactsService,
    private authService: AuthService,
    private fb: FormBuilder,
    private badgeNotificationsService: BadgeNotificationsService
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    // Mark contacts as viewed when user visits this page
    this.badgeNotificationsService.markContactsAsViewed();

    // Setup filter form changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadContacts();
      });

    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContacts(): void {
    this.isLoading = true;
    this.error = null;

    const filters: ContactFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof ContactFilters] === '') {
        delete filters[key as keyof ContactFilters];
      }
    });

    this.contactsService.getContacts(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedContactResponse) => {
          this.contacts = response.data;
          this.currentPage = response.pagination.current_page;
          this.totalPages = response.pagination.total_pages;
          this.totalItems = response.pagination.total_items;
          this.itemsPerPage = response.pagination.items_per_page;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load contacts', error);
          this.error = error.message || 'Failed to load contacts';
          this.isLoading = false;
        }
      });
  }

  updateContactStatus(contact: ContactSubmission, event: Event | string): void {
    // Handle both Event (from template) and string (from direct calls)
    const status = (typeof event === 'string' 
      ? event 
      : (event.target as HTMLSelectElement).value) as 'new' | 'read' | 'responded';

    const oldStatus = contact.status;
    contact.status = status;

    this.contactsService.updateContact(contact.id, { status })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification(`Contact status updated to ${status}`, 'success');
        },
        error: (error) => {
          contact.status = oldStatus;
          console.error('Failed to update contact status', error);
          this.showNotification('Failed to update contact status: ' + error.message, 'error');
        }
      });
  }

  deleteContact(contact: ContactSubmission): void {
    if (!confirm(`Are you sure you want to delete this contact submission from ${contact.name}?\n\nThis action cannot be undone.`)) {
      return;
    }

    this.contactsService.deleteContact(contact.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadContacts();
          this.showNotification(`Contact submission from ${contact.name} has been deleted.`, 'success');
        },
        error: (error) => {
          console.error('Failed to delete contact', error);
          this.showNotification('Failed to delete contact: ' + error.message, 'error');
        }
      });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadContacts();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadContacts();
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

  getStatusCounts(): { new: number; read: number; responded: number } {
    if (!Array.isArray(this.contacts)) {
      return { new: 0, read: 0, responded: 0 };
    }
    return this.contacts.reduce((counts, contact) => {
      counts[contact.status]++;
      return counts;
    }, { new: 0, read: 0, responded: 0 });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'new': return 'badge-danger';
      case 'read': return 'badge-warning';
      case 'responded': return 'badge-success';
      default: return 'badge-secondary';
    }
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  dismissNotification(): void {
    this.notification = null;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  truncateMessage(message: string, length: number = 100): string {
    return message.length > length ? message.substring(0, length) + '...' : message;
  }
}