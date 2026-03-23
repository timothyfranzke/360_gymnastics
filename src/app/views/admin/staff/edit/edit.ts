import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { Staff, UpdateStaffRequest, PhotoUploadResponse } from '../../../../interfaces/api';
import { ImageUploadComponent, ImageUploadValue } from '../../../../components/image-upload/image-upload';

@Component({
  selector: 'app-staff-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ImageUploadComponent]
})
export class StaffEdit implements OnInit, OnDestroy {
  staffForm: FormGroup;
  isLoading = false;
  isLoadingInitial = true;
  error: string | null = null;
  staffId: number;
  currentStaff: Staff | null = null;
  
  // Photo upload state
  isPhotoUploading = false;
  photoUploadError: string | null = null;
  currentPhotoValue: ImageUploadValue | null = null;
  
  private destroy$ = new Subject<void>();


  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.staffId = Number(this.route.snapshot.params['id']);
    
    this.staffForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.maxLength(50)]],
      hire_date: ['', [Validators.required]],
      image: [null], // For image upload component
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadStaffMember();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStaffMember(): void {
    this.isLoadingInitial = true;
    this.error = null;

    this.apiService.getStaffMember(this.staffId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (staff: Staff) => {
          this.currentStaff = staff;
          this.populateForm(staff);
          this.isLoadingInitial = false;
        },
        error: (error) => {
          console.error('Failed to load staff member', error);
          this.error = error.message || 'Failed to load staff member';
          this.isLoadingInitial = false;
        }
      });
  }

  populateForm(staff: Staff): void {
    // Set up photo value for image upload component
    if (staff.image_url) {
      this.currentPhotoValue = {
        url: staff.image_url,
        // Check if it's a local file by looking for the API pattern
        isLocal: staff.image_url.includes('/api/v1/files/staff/'),
        // Extract thumbnail URL if it's a local file
        thumbnailUrl: staff.image_thumbnail_url || undefined
      };
    } else {
      this.currentPhotoValue = null;
    }

    this.staffForm.patchValue({
      first_name: staff.first_name,
      last_name: staff.last_name,
      hire_date: staff.hire_date,
      image: this.currentPhotoValue,
      description: staff.description || ''
    });
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
      if (formData[key] === '') {
        formData[key] = null;
      }
    });

    // Handle image URL from photo upload component
    let imageUrl: string | undefined = undefined;
    if (formData.image && typeof formData.image === 'object' && formData.image.url) {
      imageUrl = formData.image.url as string;
    }

    // Create update request
    const updateData: UpdateStaffRequest = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      hire_date: formData.hire_date,
      image: imageUrl,
      description: formData.description
    };

    this.apiService.updateStaff(this.staffId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedStaff) => {
          console.log('Staff member updated successfully', updatedStaff);
          this.router.navigate(['/admin/staff']);
        },
        error: (error) => {
          console.error('Failed to update staff member', error);
          this.error = error.message || 'Failed to update staff member';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/staff']);
  }

  viewDetails(): void {
    this.router.navigate(['/admin/staff', this.staffId, 'detail']);
  }

  // Photo upload event handlers
  onPhotoUploadStart(): void {
    this.isPhotoUploading = true;
    this.photoUploadError = null;
  }

  onPhotoUploadSuccess(response: PhotoUploadResponse): void {
    this.isPhotoUploading = false;
    
    // Update the form value with the new photo data
    const newPhotoValue: ImageUploadValue = {
      url: response.original_url,
      thumbnailUrl: response.thumbnail_url,
      filename: response.filename,
      isLocal: true
    };
    
    this.currentPhotoValue = newPhotoValue;
    this.staffForm.patchValue({ image: newPhotoValue });
    
    console.log('Photo uploaded successfully', response);
  }

  onPhotoUploadError(error: string): void {
    this.isPhotoUploading = false;
    this.photoUploadError = error;
    console.error('Photo upload failed', error);
  }

  onPhotoDelete(): void {
    this.currentPhotoValue = null;
    this.staffForm.patchValue({ image: null });
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
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
      }
      if (field.errors['pattern']) {
        if (fieldName.includes('phone')) {
          return 'Please enter a valid phone number';
        }
        return `${this.getFieldDisplayName(fieldName)} format is invalid`;
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


  getStaffDisplayName(): string {
    if (!this.currentStaff) return 'Staff Member';
    return `${this.currentStaff.first_name} ${this.currentStaff.last_name}`;
  }
}