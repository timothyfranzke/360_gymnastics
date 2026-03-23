import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { Banner, UpdateBannerRequest } from '../../../../interfaces/api';

@Component({
  selector: 'app-banner-management',
  templateUrl: './management.html',
  styleUrls: ['./management.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class BannerManagement implements OnInit, OnDestroy {
  bannerForm: FormGroup;
  isLoading = true;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;
  currentBanner: Banner | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.bannerForm = this.fb.group({
      text: ['', [Validators.required, Validators.maxLength(100)]],
      is_visible: [true],
      background_color: ['#fc7900'] // Default orange color
    });
  }

  ngOnInit(): void {
    this.loadBanner();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBanner(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService.getBannerAdmin()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (banner) => {
          this.currentBanner = banner;
          this.bannerForm.patchValue({
            text: banner.text,
            is_visible: banner.is_visible,
            background_color: banner.background_color || '#fc7900'
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load banner', error);
          this.error = error.message || 'Failed to load banner configuration';
          this.isLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.bannerForm.invalid) {
      Object.keys(this.bannerForm.controls).forEach(key => {
        const control = this.bannerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSaving = true;
    this.error = null;
    this.successMessage = null;

    const formData: UpdateBannerRequest = this.bannerForm.value;

    this.apiService.updateBanner(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (banner) => {
          this.currentBanner = banner;
          this.successMessage = 'Banner updated successfully!';
          this.isSaving = false;
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (error) => {
          console.error('Failed to update banner', error);
          this.error = error.message || 'Failed to update banner';
          this.isSaving = false;
        }
      });
  }

  // Helper methods for template
  getFieldError(fieldName: string): string | null {
    const field = this.bannerForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      text: 'Banner text',
      is_visible: 'Visibility',
      background_color: 'Background color'
    };
    return labels[fieldName] || fieldName;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.bannerForm.get(fieldName);
    return !!(field?.touched && field?.errors);
  }

  refreshData(): void {
    this.loadBanner();
  }

  resetForm(): void {
    if (this.currentBanner) {
      this.bannerForm.patchValue({
        text: this.currentBanner.text,
        is_visible: this.currentBanner.is_visible,
        background_color: this.currentBanner.background_color || '#fc7900'
      });
    }
    this.error = null;
    this.successMessage = null;
  }

  // Preview color helper
  getPreviewStyle(): { [key: string]: string } {
    const color = this.bannerForm.get('background_color')?.value || '#fc7900';
    return {
      'background-color': color,
      'color': 'white',
      'padding': '12px 16px',
      'border-radius': '8px',
      'transform': 'rotate(2deg)',
      'display': 'inline-block',
      'font-weight': 'bold',
      'font-size': '1.125rem'
    };
  }
}