import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { PagesService } from '../../../../services/pages.service';
import { Page, PageFilters, PageStats } from '../../../../interfaces/page';
import { PaginatedResponse } from '../../../../interfaces/api';

@Component({
  selector: 'app-pages-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class PagesList implements OnInit, OnDestroy {
  pages: Page[] = [];
  isLoading = true;
  error: string | null = null;
  stats: PageStats | null = null;

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
    private pagesService: PagesService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      is_published: ['']
    });
  }

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadPages();
      });

    this.loadPages();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPages(): void {
    this.isLoading = true;
    this.error = null;

    const filters: PageFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort_by: 'updated_at',
      sort_order: 'DESC'
    };

    Object.keys(filters).forEach(key => {
      if (filters[key as keyof PageFilters] === '') {
        delete filters[key as keyof PageFilters];
      }
    });

    this.pagesService.getPages(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Page>) => {
          this.pages = response.data;
          this.currentPage = response.pagination.current_page;
          this.totalPages = response.pagination.total_pages;
          this.totalItems = response.pagination.total_items;
          this.itemsPerPage = response.pagination.items_per_page;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load pages', error);
          this.error = error.message || 'Failed to load pages';
          this.isLoading = false;
        }
      });
  }

  loadStats(): void {
    this.pagesService.getPageStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Failed to load page stats', error);
        }
      });
  }

  deletePage(page: Page): void {
    if (!confirm(`Are you sure you want to delete "${page.title}"?`)) {
      return;
    }

    this.pagesService.deletePage(page.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadPages();
          this.loadStats();
        },
        error: (error) => {
          console.error('Failed to delete page', error);
          alert('Failed to delete page: ' + error.message);
        }
      });
  }

  togglePublished(page: Page): void {
    this.pagesService.togglePublished(page.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          page.is_published = updated.is_published;
          this.loadStats();
        },
        error: (error) => {
          console.error('Failed to toggle page status', error);
          alert('Failed to update status: ' + error.message);
        }
      });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPages();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

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
    this.loadPages();
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
