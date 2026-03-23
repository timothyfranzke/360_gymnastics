import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FaqService } from '../../../../services/faq.service';
import { Faq, FaqCategory, UpdateFaqRequest } from '../../../../interfaces/faq';

@Component({
  selector: 'app-faq-edit',
  standalone: true,
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class FaqEdit implements OnInit, OnDestroy {
  editForm: FormGroup;
  faq: Faq | null = null;
  categories: FaqCategory[] = [];
  faqId: number = 0;
  isLoading = false;
  isLoadingFaq = true;
  isLoadingCategories = true;
  error: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private faqService: FaqService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editForm = this.fb.group({
      category_id: ['', [Validators.required]],
      question: ['', [Validators.required, Validators.maxLength(500)]],
      answer: ['', [Validators.required]],
      display_order: [0, [Validators.min(0)]],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.faqId = parseInt(this.route.snapshot.params['id']);
    this.loadCategories();
    this.loadFaq();
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

  loadFaq(): void {
    this.isLoadingFaq = true;
    this.faqService.getFaq(this.faqId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (faq) => {
          this.faq = faq;
          this.populateForm(faq);
          this.isLoadingFaq = false;
        },
        error: (error) => {
          console.error('Failed to load FAQ', error);
          this.error = error.message || 'Failed to load FAQ';
          this.isLoadingFaq = false;
        }
      });
  }

  populateForm(faq: Faq): void {
    this.editForm.patchValue({
      category_id: faq.category_id,
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
      is_active: faq.is_active
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const faqData: UpdateFaqRequest = {
      category_id: parseInt(this.editForm.value.category_id),
      question: this.editForm.value.question.trim(),
      answer: this.editForm.value.answer.trim(),
      display_order: this.editForm.value.display_order || 0,
      is_active: this.editForm.value.is_active
    };

    this.faqService.updateFaq(this.faqId, faqData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedFaq) => {
          this.successMessage = 'FAQ updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/admin/faqs']);
          }, 1500);
        },
        error: (error) => {
          console.error('Failed to update FAQ', error);
          this.error = error.message || 'Failed to update FAQ';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/faqs']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
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
    Object.keys(this.editForm.controls).forEach(key => {
      this.editForm.get(key)?.markAsTouched();
    });
  }
}
