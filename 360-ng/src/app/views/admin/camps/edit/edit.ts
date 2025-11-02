import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CampsService } from '../../../../services/camps.service';
import { Camp, UpdateCampRequest } from '../../../../interfaces/camp';

@Component({
  selector: 'app-camps-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class CampsEdit implements OnInit, OnDestroy {
  editForm: FormGroup;
  isLoading = false;
  isLoadingCamp = true;
  error: string | null = null;
  camp: Camp | null = null;
  campId: number = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private campsService: CampsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required, Validators.minLength(5)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      registration_link: ['', [Validators.required, this.urlValidator]],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.campId = +params['id'];
        this.loadCamp();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCamp(): void {
    this.isLoadingCamp = true;
    this.error = null;

    this.campsService.getCamp(this.campId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (camp) => {
          this.camp = camp;
          this.editForm.patchValue({
            title: camp.title,
            description: camp.description,
            date: camp.date,
            time: camp.time,
            cost: camp.cost,
            registration_link: camp.registration_link,
            is_active: camp.is_active
          });
          this.isLoadingCamp = false;
        },
        error: (error) => {
          console.error('Failed to load camp', error);
          this.error = error.message || 'Failed to load camp';
          this.isLoadingCamp = false;
        }
      });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData: UpdateCampRequest = this.editForm.value;

    this.campsService.updateCamp(this.campId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/camps']);
        },
        error: (error) => {
          console.error('Failed to update camp', error);
          this.error = error.message || 'Failed to update camp';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/camps']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
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
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
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
    const selectedDate = this.editForm.get('date')?.value;
    if (!selectedDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const campDate = new Date(selectedDate);
    
    return campDate < today;
  }

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Check if camp is upcoming
  isCampUpcoming(): boolean {
    if (!this.camp) return false;
    const campDate = new Date(this.camp.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return campDate >= today;
  }
}