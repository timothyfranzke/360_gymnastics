import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ClassesService } from '../../../../services/classes';
import { AuthService } from '../../../../services/auth.service';
import { Class } from '../../../../interface/class';
import { ClassFilters } from '../../../../interfaces/api';
import { PaginatedResponse, User } from '../../../../interfaces/api';

@Component({
  selector: 'app-classes-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class ClassesList implements OnInit, OnDestroy {
  classes: Class[] = [];
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
    private classesService: ClassesService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      ageRange: [''],
      featured: ['']
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
        this.loadClasses();
      });

    this.loadClasses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClasses(): void {
    this.isLoading = true;
    this.error = null;

    const filters: ClassFilters = {
      ...this.filterForm.value,
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof ClassFilters] === '') {
        delete filters[key as keyof ClassFilters];
      }
    });

    this.classesService.getClasses(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Class>) => {
          this.classes = response.data;
          this.currentPage = response.pagination.current_page;
          this.totalPages = response.pagination.total_pages;
          this.totalItems = response.pagination.total_items;
          this.itemsPerPage = response.pagination.items_per_page;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load classes', error);
          this.error = error.message || 'Failed to load classes';
          this.isLoading = false;
        }
      });
  }


  deleteClass(classItem: Class): void {
    if (!confirm(`Are you sure you want to delete "${classItem.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    this.classesService.deleteClass(classItem.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadClasses();
          this.showNotification(`Class "${classItem.name}" has been deleted.`, 'success');
        },
        error: (error) => {
          console.error('Failed to delete class', error);
          this.showNotification('Failed to delete class: ' + error.message, 'error');
        }
      });
  }

  toggleFeaturedStatus(classItem: Class): void {
    const newStatus = !classItem.featured;
    
    // Update the local data immediately for better UX
    classItem.featured = newStatus;

    this.classesService.updateClass(classItem.id, { featured: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const statusText = newStatus ? 'featured' : 'unfeatured';
          this.showNotification(`Class "${classItem.name}" has been ${statusText}.`, 'success');
        },
        error: (error) => {
          // Revert the change on error
          classItem.featured = !newStatus;
          console.error('Failed to update class status', error);
          this.showNotification('Failed to update status: ' + error.message, 'error');
        }
      });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadClasses();
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
    this.loadClasses();
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

  // Helper methods for template
  getSkillsPreview(skills: string[]): string {
    if (!skills || skills.length === 0) return 'No skills listed';
    if (skills.length <= 2) return skills.join(', ');
    return `${skills.slice(0, 2).join(', ')} and ${skills.length - 2} more`;
  }

  getPrerequisitesPreview(prerequisites: string[]): string {
    if (!prerequisites || prerequisites.length === 0) return 'No prerequisites';
    if (prerequisites.length <= 2) return prerequisites.join(', ');
    return `${prerequisites.slice(0, 2).join(', ')} and ${prerequisites.length - 2} more`;
  }

  getFeaturedCount(): number {
    return this.classes.filter(c => c.featured === true).length;
  }

  getUniqueAgeGroupsCount(): number {
    if (this.classes.length === 0) return 0;
    const uniqueAgeRanges = new Set(this.classes.map(c => c.ageRange));
    return uniqueAgeRanges.size;
  }

  getClassesWithPrerequisitesCount(): number {
    return this.classes.filter(c => c.prerequisites && c.prerequisites.length > 0).length;
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
}