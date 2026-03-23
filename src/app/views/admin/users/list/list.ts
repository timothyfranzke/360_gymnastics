import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import {
  User,
  PaginatedResponse
} from '../../../../interfaces/api';

interface UserFilters {
  search?: string;
  role?: 'admin' | 'staff';
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

@Component({
  selector: 'app-user-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class UserList implements OnInit, OnDestroy {
  users: User[] = [];
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
      role: ['']
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
        this.loadUsers();
      });

    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    const filters: UserFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort_by: 'created_at',
      sort_order: 'DESC'
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof UserFilters] === '') {
        delete filters[key as keyof UserFilters];
      }
    });

    this.apiService.getUsers(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<User>) => {
          console.log(response)
          this.users = response.data || [];
          this.currentPage = response.pagination?.current_page || 1;
          this.totalPages = response.pagination?.total_pages || 1;
          this.totalItems = response.pagination?.total_items || 0;
          this.itemsPerPage = response.pagination?.items_per_page || 10;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load users', error);
          this.error = error.message || 'Failed to load users';
          this.users = []; // Ensure users is always an array
          this.isLoading = false;
        }
      });
  }

  
  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
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
    this.loadUsers();
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

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'badge badge-primary';
      case 'staff':
        return 'badge badge-secondary';
      default:
        return 'badge badge-light';
    }
  }

  canEditUser(user: User): boolean {
    if (!this.currentUser) return false;
    
    // Admins can edit anyone except themselves
    if (this.currentUser.role === 'admin') {
      return this.currentUser.id !== user.id;
    }
    
    // Staff cannot edit users
    return false;
  }

  canDeleteUser(user: User): boolean {
    if (!this.currentUser) return false;
    
    // Admins can delete anyone except themselves
    if (this.currentUser.role === 'admin') {
      return this.currentUser.id !== user.id;
    }
    
    // Staff cannot delete users
    return false;
  }

  deleteUser(user: User): void {
    if (!this.canDeleteUser(user)) return;

    if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      this.apiService.deleteUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('User deleted successfully');
            this.loadUsers(); // Refresh the list
          },
          error: (error) => {
            console.error('Failed to delete user', error);
            this.error = error.message || 'Failed to delete user';
          }
        });
    }
  }
}