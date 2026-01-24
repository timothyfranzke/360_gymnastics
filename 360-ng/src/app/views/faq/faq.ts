import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FaqService } from '../../services/faq.service';
import { FaqGroupedByCategory, Faq } from '../../interfaces/faq';
import { ViewHeader } from '../../components/view-header/view-header';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewHeader],
  templateUrl: './faq.html',
  styleUrls: ['./faq.scss'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: 1
      })),
      transition('collapsed <=> expanded', [
        animate('300ms ease-in-out')
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class FaqView implements OnInit {
  categories: FaqGroupedByCategory[] = [];
  searchQuery = '';
  searchResults: Faq[] = [];
  isSearching = false;
  loading = true;
  error: string | null = null;

  expandedFaqs: Set<number> = new Set();
  activeCategory: string | null = null;

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.loadFaqs();
  }

  private loadFaqs(): void {
    this.loading = true;
    this.error = null;

    this.faqService.getFaqs().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;

        // Expand first category by default
        if (categories.length > 0) {
          this.activeCategory = categories[0].slug;
        }
      },
      error: (error) => {
        console.error('Error loading FAQs:', error);
        this.error = 'Failed to load FAQs. Please try again later.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.length < 2) {
      this.isSearching = false;
      this.searchResults = [];
      return;
    }

    this.isSearching = true;

    this.faqService.searchFaqs(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;

        // Auto-expand search results
        results.forEach(faq => this.expandedFaqs.add(faq.id));
      },
      error: (error) => {
        console.error('Search error:', error);
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.isSearching = false;
    this.searchResults = [];
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

  setActiveCategory(slug: string): void {
    this.activeCategory = this.activeCategory === slug ? null : slug;
  }

  isCategoryActive(slug: string): boolean {
    return this.activeCategory === slug;
  }

  retryLoad(): void {
    this.loadFaqs();
  }
}
