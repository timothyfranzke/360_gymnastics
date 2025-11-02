import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CampsService } from '../../../../services/camps.service';
import { CreateCampRequest } from '../../../../interfaces/camp';

@Component({
  selector: 'app-camps-create',
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class CampsCreate implements OnInit, OnDestroy {
  createForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private campsService: CampsService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required, Validators.minLength(5)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      registration_link: ['', [Validators.required, this.urlValidator]]
    });
  }

  ngOnInit(): void {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    this.createForm.patchValue({
      date: tomorrowString,
      time: '9:00 AM - 3:00 PM',
      registration_link: 'https://360gymnastics.com/register/'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData: CreateCampRequest = this.createForm.value;

    this.campsService.createCamp(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/camps']);
        },
        error: (error) => {
          console.error('Failed to create camp', error);
          this.error = error.message || 'Failed to create camp';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/camps']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createForm.controls).forEach(key => {
      const control = this.createForm.get(key);
      control?.markAsTouched();
    });
  }

  // Custom URL validator
  private urlValidator(control: any) {
    if (!control.value) {
      return null;
    }
    
    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${minLength} characters`;
      }
      if (field.errors['min']) {
        const min = field.errors['min'].min;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${min}`;
      }
      if (field.errors['invalidUrl']) {
        return `${this.getFieldDisplayName(fieldName)} must be a valid URL`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      title: 'Title',
      description: 'Description',
      date: 'Date',
      time: 'Time',
      cost: 'Cost',
      registration_link: 'Registration Link'
    };
    return displayNames[fieldName] || fieldName;
  }

  // Check if date is in the past
  isDateInPast(): boolean {
    const selectedDate = this.createForm.get('date')?.value;
    if (!selectedDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const campDate = new Date(selectedDate);
    
    return campDate < today;
  }
}