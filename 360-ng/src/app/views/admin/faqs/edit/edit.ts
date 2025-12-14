import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { FAQ } from '../list/list';

@Component({
  selector: 'app-faq-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule]
})
export class FaqEdit implements OnInit, OnDestroy {
  faqForm: FormGroup;
  isSubmitting = false;
  isLoading = true;
  faqId: number | null = null;
  categories: string[] = [];
  
  // Notification
  notification: { type: 'success' | 'error'; message: string } | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.faqForm = this.fb.group({
      question: ['', [Validators.required, Validators.maxLength(1000)]],
      answer: ['', [Validators.required, Validators.maxLength(5000)]],
      category: ['General', [Validators.maxLength(100)]],
      display_order: [0, [Validators.min(0)]],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.faqId = +params['id'];
        if (this.faqId) {
          this.loadFaq();
          this.loadCategories();
        } else {
          this.router.navigate(['/admin/faqs']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFaq(): void {
    if (!this.faqId) return;
    
    this.isLoading = true;
    this.apiService.getFaq(this.faqId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const faq = response.data;
          this.faqForm.patchValue({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            display_order: faq.display_order,
            is_active: faq.is_active
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load FAQ', error);
          this.showNotification('error', 'Failed to load FAQ: ' + error.message);
          this.isLoading = false;
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
        }
      });
  }

  onSubmit(): void {
    if (this.faqForm.valid && !this.isSubmitting && this.faqId) {
      this.isSubmitting = true;
      
      const faqData = this.faqForm.value;
      
      this.apiService.updateFaq(this.faqId, faqData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('success', 'FAQ updated successfully');
            setTimeout(() => {
              this.router.navigate(['/admin/faqs']);
            }, 2000);
          },
          error: (error) => {
            console.error('Failed to update FAQ', error);
            this.showNotification('error', 'Failed to update FAQ: ' + error.message);
            this.isSubmitting = false;
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.faqForm.controls).forEach(key => {
      const control = this.faqForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.faqForm.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} is too long (max ${field.errors['maxlength'].requiredLength} characters)`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      question: 'Question',
      answer: 'Answer',
      category: 'Category',
      display_order: 'Display Order'
    };
    return labels[fieldName] || fieldName;
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