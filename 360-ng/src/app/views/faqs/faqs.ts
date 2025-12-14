import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ApiService } from '../../services/api.service';
import { ViewHeader } from '../../components/view-header/view-header';
import { FAQ } from '../../interfaces/api';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.html',
  styleUrls: ['./faqs.scss'],
  imports: [CommonModule, ViewHeader, ReactiveFormsModule],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0', overflow: 'hidden', opacity: '0' })),
      state('expanded', style({ height: '*', overflow: 'visible', opacity: '1' })),
      transition('collapsed => expanded', animate('300ms ease-out')),
      transition('expanded => collapsed', animate('300ms ease-in'))
    ])
  ]
})
export class Faqs implements OnInit, OnDestroy {
  animationState = 'in';
  faqs: FAQ[] = [];
  isLoading = true;
  error: string | null = null;
  categories: string[] = [];
  expandedFaqs: Set<number> = new Set();
  
  filterForm: FormGroup;
  
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      search: ['']
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
        this.loadFaqs();
      });

    this.loadFaqs();
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
      active_only: true,
      ...this.filterForm.value
    };

    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key];
      }
    });

    this.apiService.getFaqs(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.faqs = response || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load FAQs', error);
          this.error = error.message || 'Failed to load FAQs';
          this.isLoading = false;
          this.faqs = [];
        }
      });
  }

  loadCategories(): void {
    this.apiService.getFaqCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories = response.data || [];
        },
        error: (error) => {
          console.error('Failed to load FAQ categories', error);
          this.categories = [];
        }
      });
  }

  toggleFaq(faqId: number): void {
    if (this.expandedFaqs.has(faqId)) {
      this.expandedFaqs.delete(faqId);
    } else {
      this.expandedFaqs.add(faqId);
    }
  }

  isFaqExpanded(faqId: number): boolean {
    return this.expandedFaqs.has(faqId);
  }

  getExpandedState(faqId: number): string {
    return this.isFaqExpanded(faqId) ? 'expanded' : 'collapsed';
  }

  clearFilters(): void {
    this.filterForm.reset({
      category: '',
      search: ''
    });
    this.loadFaqs();
  }

  getFaqsByCategory(): { [key: string]: FAQ[] } {
    if (!this.faqs.length) return {};

    const grouped = this.faqs.reduce((acc, faq) => {
      const category = faq.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {} as { [key: string]: FAQ[] });

    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.display_order - b.display_order);
    });

    return grouped;
  }

  getFilteredCategories(): string[] {
    const selectedCategory = this.filterForm.get('category')?.value;
    if (selectedCategory) {
      return [selectedCategory];
    }

    const grouped = this.getFaqsByCategory();
    return Object.keys(grouped).sort();
  }

  trackByFaqId(index: number, faq: FAQ): number {
    return faq.id;
  }
}