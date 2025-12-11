import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { OpenGymService, AgeGroup } from '../../../../../services/open-gym';

@Component({
  selector: 'app-age-group-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AgeGroupEdit implements OnInit, OnDestroy {
  ageGroupForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;
  ageGroupId: number | null = null;
  ageGroup: AgeGroup | null = null;
  
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
    private router: Router,
    private route: ActivatedRoute
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
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.ageGroupId = +params['id'];
      if (this.ageGroupId) {
        this.loadAgeGroup();
      } else {
        this.router.navigate(['/admin/open-gym']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAgeGroup(): void {
    if (!this.ageGroupId) return;

    this.isLoading = true;
    this.error = null;

    this.openGymService.getAgeGroup(this.ageGroupId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ageGroup) => {
          this.ageGroup = ageGroup;
          this.ageGroupForm.patchValue({
            title: ageGroup.title,
            subtitle: ageGroup.subtitle || '',
            days: ageGroup.days || '',
            time: ageGroup.time || '',
            price: ageGroup.price,
            priceUnit: ageGroup.priceUnit || 'per session',
            notes: ageGroup.notes || '',
            sortOrder: ageGroup.sortOrder || 0,
            colorTheme: ageGroup.colorTheme || 'cyan'
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load age group', error);
          this.error = error.message || 'Failed to load age group';
          this.isLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.ageGroupForm.invalid || !this.ageGroupId) {
      this.markFormGroupTouched(this.ageGroupForm);
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const formData: Partial<AgeGroup> = {
      ...this.ageGroupForm.value
    };

    this.openGymService.updateAgeGroup(this.ageGroupId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.router.navigate(['/admin/open-gym'], {
            queryParams: { updated: 'success' }
          });
        },
        error: (error) => {
          console.error('Failed to update age group', error);
          this.error = error.message || 'Failed to update age group';
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