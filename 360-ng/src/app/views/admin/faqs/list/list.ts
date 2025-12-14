import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqStats {
  total: number;
  active: number;
  inactive: number;
  categories: number;
}

@Component({
  selector: 'app-faq-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class FaqList implements OnInit, OnDestroy {
  faqs: FAQ[] = [];
  isLoading = true;
  error: string | null = null;
  stats: FaqStats | null = null;
  categories: string[] = [];
  
  // Filters
  filterForm: FormGroup;
  
  // Notification
  notification: { type: 'success' | 'error'; message: string } | null = null;

  Math = Math;
  
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      active_only: [true]
    });
  }

  ngOnInit(): void {
    // Setup filter form changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadFaqs();
      });

    this.loadFaqs();
    this.loadStats();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFaqs(): void {
    this.isLoading = true;
    this.error = null;

    const params = {
      ...this.filterForm.value
    };

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key];
      }
    });

    this.apiService.getFaqs(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.faqs = response.data || response; // Handle both paginated and direct responses
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load FAQs', error);
          this.error = error.message || 'Failed to load FAQs';
          this.isLoading = false;
        }
      });
  }

  loadStats(): void {
    this.apiService.getFaqStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.stats = response.data;
        },
        error: (error) => {
          console.error('Failed to load FAQ stats', error);
        }
      });
  }

  loadCategories(): void {
    this.apiService.getFaqCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories = response.data;
        },
        error: (error) => {
          console.error('Failed to load FAQ categories', error);
        }
      });
  }

  toggleFaqStatus(faq: FAQ): void {
    this.apiService.toggleFaq(faq.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          faq.is_active = !faq.is_active;
          this.showNotification('success', `FAQ ${faq.is_active ? 'activated' : 'deactivated'} successfully`);
          this.loadStats(); // Refresh stats
        },
        error: (error) => {
          console.error('Failed to toggle FAQ status', error);
          this.showNotification('error', 'Failed to update FAQ status: ' + error.message);
        }
      });
  }

  deleteFaq(faq: FAQ): void {
    if (!confirm(`Are you sure you want to delete the FAQ: "${this.truncateText(faq.question, 50)}"?`)) {
      return;
    }

    this.apiService.deleteFaq(faq.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadFaqs();
          this.loadStats();
          this.loadCategories();
          this.showNotification('success', 'FAQ deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete FAQ', error);
          this.showNotification('error', 'Failed to delete FAQ: ' + error.message);
        }
      });
  }

  // Helper methods
  truncateText(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      category: '',
      active_only: true
    });
    this.loadFaqs();
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };
    setTimeout(() => {
      this.notification = null;
    }, 5000);
  }

  dismissNotification(): void {
    this.notification = null;
  }
}