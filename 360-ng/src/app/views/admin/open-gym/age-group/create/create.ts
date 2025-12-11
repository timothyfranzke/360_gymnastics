import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { OpenGymService, AgeGroup } from '../../../../../services/open-gym';

@Component({
  selector: 'app-age-group-create',
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AgeGroupCreate implements OnInit, OnDestroy {
  ageGroupForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  
  colorThemeOptions = [
    { value: 'cyan', label: 'Cyan', colorClass: 'bg-cyan-100 text-cyan-800' },
    { value: 'orange', label: 'Orange', colorClass: 'bg-orange-100 text-orange-800' },
    { value: 'purple', label: 'Purple', colorClass: 'bg-purple-100 text-purple-800' },
    { value: 'pink', label: 'Pink', colorClass: 'bg-pink-100 text-pink-800' },
    { value: 'green', label: 'Green', colorClass: 'bg-green-100 text-green-800' },
    { value: 'blue', label: 'Blue', colorClass: 'bg-blue-100 text-blue-800' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private openGymService: OpenGymService,
    private router: Router
  ) {
    this.ageGroupForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      subtitle: ['', [Validators.maxLength(200)]],
      days: ['', [Validators.maxLength(100)]],
      time: ['', [Validators.maxLength(100)]],
      price: [null, [Validators.min(0)]],
      priceUnit: ['per session', [Validators.maxLength(50)]],
      notes: [''],
      sortOrder: [0, [Validators.min(0)]],
      colorTheme: ['cyan']
    });
  }

  ngOnInit(): void {
    // Load current age groups to determine next sort order
    this.openGymService.getAgeGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ageGroups) => {
          const maxSortOrder = Math.max(...ageGroups.map(ag => ag.sortOrder || 0), -1);
          this.ageGroupForm.patchValue({ sortOrder: maxSortOrder + 1 });
        },
        error: (error) => {
          console.error('Failed to load age groups for sort order', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.ageGroupForm.invalid) {
      this.markFormGroupTouched(this.ageGroupForm);
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const formData: Omit<AgeGroup, 'id' | 'created_at' | 'updated_at'> = {
      ...this.ageGroupForm.value
    };

    this.openGymService.createAgeGroup(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.router.navigate(['/admin/open-gym'], {
            queryParams: { created: 'success' }
          });
        },
        error: (error) => {
          console.error('Failed to create age group', error);
          this.error = error.message || 'Failed to create age group';
          this.isSubmitting = false;
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/admin/open-gym']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.ageGroupForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} is too long`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be positive`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      subtitle: 'Subtitle',
      days: 'Days',
      time: 'Time',
      price: 'Price',
      priceUnit: 'Price unit',
      notes: 'Notes',
      sortOrder: 'Sort order',
      colorTheme: 'Color theme'
    };
    return labels[fieldName] || fieldName;
  }

  getSelectedColorTheme(): { value: string; label: string; colorClass: string } | undefined {
    const selectedValue = this.ageGroupForm.get('colorTheme')?.value;
    return this.colorThemeOptions.find(t => t.value === selectedValue);
  }
}