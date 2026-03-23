import { Component, Inject, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { ClassesService } from '../../services/classes';
import { Class } from '../../interface/class';
import { ClassPageSettings, PricingTier } from '../../interfaces/api';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ViewHeader } from '../../components/view-header/view-header';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.html',
  styleUrls: ['./classes.scss'],
  imports: [CommonModule, RouterLink, ViewHeader, FormsModule],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('fadeInUpDelay', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms 200ms ease-out')
      ])
    ])
  ]
})
export class Classes implements OnInit {
  animationState = 'in';
  classes: Class[] = [];
  filteredClasses: Class[] = [];
  groupedClasses: { category: string; classes: Class[] }[] = [];

  // Search and filter
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = ['PRESCHOOL', 'LEVEL CLASSES', 'BOYS CLASSES', 'TUMBLING', 'OTHER'];

  // Page settings
  pageDescription = 'We offer a variety of classes for all ages and skill levels. Our experienced instructors provide a fun, no-pressure atmosphere while teaching the fundamentals of gymnastics, social skills, and life skills.';
  pricingTiers: PricingTier[] = [
    { duration: '50 minute class', price: '$69/month' },
    { duration: '55 minute class', price: '$74/month' },
    { duration: '60 minute class', price: '$82/month' },
    { duration: '90 minute class', price: '$97/month' }
  ];
  registrationFee = '$15 annual registration fee per person ($30 max per family)';

  constructor(
    private classesService: ClassesService
  ) { }

  ngOnInit(): void {
    // Load page settings
    this.classesService.getClassPageSettings().subscribe({
      next: (settings) => {
        this.pageDescription = settings.description || this.pageDescription;
        this.pricingTiers = settings.pricing_tiers || this.pricingTiers;
        this.registrationFee = settings.registration_fee || this.registrationFee;
      },
      error: (error) => {
        console.error('Error loading class page settings:', error);
        // Keep default values on error
      }
    });

    // Load classes from API
    this.classesService.getClasses().subscribe({
      next: (classes) => {
        this.classes = classes.data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading featured classes:', error);
        // Fallback to local data
        this.classes = this.classesService.getLocalClasses();
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.classes];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(gymClass =>
        gymClass.name.toLowerCase().includes(term) ||
        gymClass.description.toLowerCase().includes(term) ||
        gymClass.ageRange.toLowerCase().includes(term) ||
        (gymClass.category && gymClass.category.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(gymClass =>
        (gymClass.category || 'OTHER') === this.selectedCategory
      );
    }

    this.filteredClasses = filtered;
    this.groupClassesByCategory();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || this.selectedCategory !== '';
  }

  get totalResults(): number {
    return this.filteredClasses.length;
  }

  private groupClassesByCategory(): void {
    const categoryOrder = ['PRESCHOOL', 'LEVEL CLASSES', 'BOYS CLASSES', 'TUMBLING', 'OTHER'];
    const grouped = new Map<string, Class[]>();

    // Group filtered classes by category
    this.filteredClasses.forEach(gymClass => {
      const category = gymClass.category || 'OTHER';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(gymClass);
    });

    // Convert to array and sort by predefined order
    this.groupedClasses = Array.from(grouped.entries())
      .sort((a, b) => {
        const indexA = categoryOrder.indexOf(a[0]);
        const indexB = categoryOrder.indexOf(b[0]);
        // If not in order list, put at end
        const sortA = indexA === -1 ? 999 : indexA;
        const sortB = indexB === -1 ? 999 : indexB;
        return sortA - sortB;
      })
      .map(([category, classes]) => ({ category, classes }));
  }

  scrollToSchedule(): void {
    const element = document.getElementById('class-schedule');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToClassTypes(): void {
    const element = document.getElementById('class-types');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}