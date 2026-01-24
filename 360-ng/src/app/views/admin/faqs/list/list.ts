import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FaqService } from '../../../../services/faq.service';
import { AuthService } from '../../../../services/auth.service';
import { Faq, FaqCategory, FaqFilters, FaqStats } from '../../../../interfaces/faq';
import { PaginatedResponse, User } from '../../../../interfaces/api';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class FaqList implements OnInit, OnDestroy {
  faqs: Faq[] = [];
  categories: FaqCategory[] = [];
  stats: FaqStats | null = null;
  isLoading = true;
  error: string | null = null;
  currentUser: User | null = null;
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
    private faqService: FaqService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      category_id: [''],
      is_active: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Load categories for filter dropdown
    this.loadCategories();

    // Load stats
    this.loadStats();

    // Setup filter form changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadFaqs();
      });

    this.loadFaqs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.faqService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Failed to load categories', error);
        }
      });
  }

  loadStats(): void {
    this.faqService.getFaqStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Failed to load stats', error);
        }
      });
  }

  loadFaqs(): void {
    this.isLoading = true;
    this.error = null;

    const filters: FaqFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort_by: 'display_order',
      sort_order: 'ASC'
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof FaqFilters] === '') {
        delete filters[key as keyof FaqFilters];
      }
    });

    this.faqService.getAllFaqs(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Faq>) => {
          this.faqs = response.data;
          this.currentPage = response.pagination.current_page;
          this.totalPages = response.pagination.total_pages;
          this.totalItems = response.pagination.total_items;
          this.itemsPerPage = response.pagination.items_per_page;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load FAQs', error);
          this.error = error.message || 'Failed to load FAQs';
          this.isLoading = false;
        }
      });
  }

  deleteFaq(faq: Faq): void {
    if (!confirm(`Are you sure you want to delete this FAQ?\n\n"${faq.question}"`)) {
      return;
    }

    this.faqService.deleteFaq(faq.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification('FAQ deleted successfully', 'success');
          this.loadFaqs();
          this.loadStats();
        },
        error: (error) => {
          console.error('Failed to delete FAQ', error);
          this.showNotification('Failed to delete FAQ: ' + error.message, 'error');
        }
      });
  }

  toggleActiveStatus(faq: Faq): void {
    const originalStatus = faq.is_active;
    faq.is_active = !faq.is_active; // Optimistic update

    this.faqService.toggleFaq(faq.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedFaq) => {
          faq.is_active = updatedFaq.is_active;
          this.showNotification(
            `FAQ ${updatedFaq.is_active ? 'activated' : 'deactivated'} successfully`,
            'success'
          );
          this.loadStats();
        },
        error: (error) => {
          faq.is_active = originalStatus; // Revert on error
          console.error('Failed to toggle FAQ status', error);
          this.showNotification('Failed to update status: ' + error.message, 'error');
        }
      });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadFaqs();
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
    this.loadFaqs();
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

  truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }
}
