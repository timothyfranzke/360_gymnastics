import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FaqService } from '../../../../services/faq.service';
import { FaqCategory, CreateFaqRequest } from '../../../../interfaces/faq';

@Component({
  selector: 'app-faq-create',
  standalone: true,
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class FaqCreate implements OnInit, OnDestroy {
  createForm: FormGroup;
  categories: FaqCategory[] = [];
  isLoading = false;
  isLoadingCategories = true;
  error: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private faqService: FaqService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      category_id: ['', [Validators.required]],
      question: ['', [Validators.required, Validators.maxLength(500)]],
      answer: ['', [Validators.required]],
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
    this.isLoadingCategories = true;
    this.faqService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.isLoadingCategories = false;
        },
        error: (error) => {
          console.error('Failed to load categories', error);
          this.isLoadingCategories = false;
        }
      });
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const faqData: CreateFaqRequest = {
      category_id: parseInt(this.createForm.value.category_id),
      question: this.createForm.value.question.trim(),
      answer: this.createForm.value.answer.trim(),
      display_order: this.createForm.value.display_order || 0,
      is_active: this.createForm.value.is_active
    };

    this.faqService.createFaq(faqData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdFaq) => {
          this.successMessage = 'FAQ created successfully!';
          setTimeout(() => {
            this.router.navigate(['/admin/faqs']);
          }, 1500);
        },
        error: (error) => {
          console.error('Failed to create FAQ', error);
          this.error = error.message || 'Failed to create FAQ';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/faqs']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      category_id: 'Category',
      question: 'Question',
      answer: 'Answer',
      display_order: 'Display order'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createForm.controls).forEach(key => {
      this.createForm.get(key)?.markAsTouched();
    });
  }
}
