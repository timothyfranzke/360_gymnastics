import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { CreateStaffRequest, PhotoUploadResponse } from '../../../../interfaces/api';
import { ImageUploadComponent, ImageUploadValue } from '../../../../components/image-upload/image-upload';

@Component({
  selector: 'app-staff-add',
  templateUrl: './add.html',
  styleUrls: ['./add.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ImageUploadComponent]
})
export class StaffAdd implements OnInit, OnDestroy {
  staffForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  
  // Photo upload state
  isPhotoUploading = false;
  photoUploadError: string | null = null;
  uploadedPhotoData: PhotoUploadResponse | null = null;
  createdUserId: number | null = null;
  
  private destroy$ = new Subject<void>();


  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.staffForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.maxLength(50)]],
      hire_date: ['', [Validators.required]],
      image: [null], // For image upload component
      description: ['']
    });
  }

  ngOnInit(): void {
    // Set default hire date to today
    const today = new Date().toISOString().split('T')[0];
    this.staffForm.patchValue({
      hire_date: today
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  onSubmit(): void {
    if (this.staffForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData = { ...this.staffForm.value };

    // Remove empty optional fields
    Object.keys(formData).forEach(key => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

    // Add image path if photo was uploaded
    if (this.uploadedPhotoData) {
      formData.image = this.uploadedPhotoData.path;
    }

    const staffData: CreateStaffRequest = formData;
    
    this.apiService.createStaff(staffData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdStaff) => {
          console.log('Staff member created successfully', createdStaff);
          this.router.navigate(['/admin/staff']);
        },
        error: (error) => {
          console.error('Failed to create staff member', error);
          this.error = error.message || 'Failed to create staff member';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/staff']);
  }

  // Photo upload event handlers
  onPhotoUploadStart(): void {
    this.isPhotoUploading = true;
    this.photoUploadError = null;
  }

  onPhotoUploadSuccess(response: PhotoUploadResponse): void {
    this.isPhotoUploading = false;
    this.uploadedPhotoData = response;
    console.log('Photo uploaded successfully', response);
  }

  onPhotoUploadError(error: string): void {
    this.isPhotoUploading = false;
    this.photoUploadError = error;
    console.error('Photo upload failed', error);
  }

  onPhotoDelete(): void {
    this.uploadedPhotoData = null;
    this.photoUploadError = null;
  }


  private markFormGroupTouched(): void {
    Object.keys(this.staffForm.controls).forEach(key => {
      const control = this.staffForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.staffForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.staffForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      first_name: 'First Name',
      last_name: 'Last Name',
      hire_date: 'Hire Date',
      image: 'Image',
      description: 'Description'
    };
    return displayNames[fieldName] || fieldName;
  }

}