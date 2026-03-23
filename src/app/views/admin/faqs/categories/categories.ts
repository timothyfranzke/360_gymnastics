import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FaqService } from '../../../../services/faq.service';
import { FaqCategory, CreateFaqCategoryRequest, UpdateFaqCategoryRequest } from '../../../../interfaces/faq';

@Component({
  selector: 'app-faq-categories',
  standalone: true,
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class FaqCategories implements OnInit, OnDestroy {
  categories: FaqCategory[] = [];
  isLoading = true;
  error: string | null = null;
  notification: { message: string; type: 'success' | 'error' } | null = null;

  // Modal state
  showModal = false;
  isEditing = false;
  editingCategoryId: number | null = null;
  isSaving = false;

  categoryForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private faqService: FaqService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      slug: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-z0-9-]+$/)]],
      description: [''],
      display_order: [0, [Validators.min(0)]],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.error = null;

    this.faqService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load categories', error);
          this.error = error.message || 'Failed to load categories';
          this.isLoading = false;
        }
      });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingCategoryId = null;
    this.categoryForm.reset({
      name: '',
      slug: '',
      description: '',
      display_order: 0,
      is_active: true
    });
    this.showModal = true;
  }

  openEditModal(category: FaqCategory): void {
    this.isEditing = true;
    this.editingCategoryId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      display_order: category.display_order,
      is_active: category.is_active
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingCategoryId = null;
    this.categoryForm.reset();
  }

  generateSlug(): void {
    const name = this.categoryForm.get('name')?.value || '';
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    this.categoryForm.patchValue({ slug });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;

    if (this.isEditing && this.editingCategoryId) {
      const updateData: UpdateFaqCategoryRequest = {
        name: this.categoryForm.value.name.trim(),
        slug: this.categoryForm.value.slug.trim(),
        description: this.categoryForm.value.description?.trim() || null,
        display_order: this.categoryForm.value.display_order || 0,
        is_active: this.categoryForm.value.is_active
      };

      this.faqService.updateCategory(this.editingCategoryId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('Category updated successfully', 'success');
            this.closeModal();
            this.loadCategories();
            this.isSaving = false;
          },
          error: (error) => {
            this.showNotification('Failed to update category: ' + error.message, 'error');
            this.isSaving = false;
          }
        });
    } else {
      const createData: CreateFaqCategoryRequest = {
        name: this.categoryForm.value.name.trim(),
        slug: this.categoryForm.value.slug.trim(),
        description: this.categoryForm.value.description?.trim() || undefined,
        display_order: this.categoryForm.value.display_order || 0,
        is_active: this.categoryForm.value.is_active
      };

      this.faqService.createCategory(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('Category created successfully', 'success');
            this.closeModal();
            this.loadCategories();
            this.isSaving = false;
          },
          error: (error) => {
            this.showNotification('Failed to create category: ' + error.message, 'error');
            this.isSaving = false;
          }
        });
    }
  }

  deleteCategory(category: FaqCategory): void {
    if (!confirm(`Are you sure you want to delete "${category.name}"?\n\nThis will also delete all FAQs in this category.`)) {
      return;
    }

    this.faqService.deleteCategory(category.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification('Category deleted successfully', 'success');
          this.loadCategories();
        },
        error: (error) => {
          this.showNotification('Failed to delete category: ' + error.message, 'error');
        }
      });
  }

  toggleCategoryStatus(category: FaqCategory): void {
    const originalStatus = category.is_active;
    category.is_active = !category.is_active;

    this.faqService.toggleCategory(category.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedCategory) => {
          category.is_active = updatedCategory.is_active;
          this.showNotification(
            `Category ${updatedCategory.is_active ? 'activated' : 'deactivated'} successfully`,
            'success'
          );
        },
        error: (error) => {
          category.is_active = originalStatus;
          this.showNotification('Failed to update status: ' + error.message, 'error');
        }
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Slug can only contain lowercase letters, numbers, and hyphens';
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      slug: 'Slug',
      description: 'Description',
      display_order: 'Display order'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      this.categoryForm.get(key)?.markAsTouched();
    });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }
}
