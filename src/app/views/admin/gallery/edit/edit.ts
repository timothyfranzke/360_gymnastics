import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';

interface GalleryImage {
  id: number;
  filename: string;
  original_filename: string;
  alt_text?: string;
  caption?: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  dimensions_width?: number;
  dimensions_height?: number;
  order_index: number;
  is_featured: boolean;
  is_active: boolean;
  url: string;
  thumbnail_url: string;
  created_at: string;
  updated_at?: string;
}

interface UpdateGalleryRequest {
  alt_text?: string;
  caption?: string;
  order_index?: number;
  is_featured?: boolean;
  is_active?: boolean;
}

@Component({
  selector: 'app-gallery-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class GalleryEdit implements OnInit, OnDestroy {
  editForm: FormGroup;
  isLoading = false;
  isLoadingInitial = true;
  error: string | null = null;
  imageId: number;
  currentImage: GalleryImage | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.imageId = Number(this.route.snapshot.params['id']);
    
    this.editForm = this.fb.group({
      alt_text: ['', [Validators.maxLength(255)]],
      caption: ['', [Validators.maxLength(500)]],
      order_index: [0, [Validators.required, Validators.min(0)]],
      is_featured: [false],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadImage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadImage(): void {
    this.isLoadingInitial = true;
    this.error = null;

    this.apiService.get<{ data: { image: GalleryImage } }>(`/gallery/${this.imageId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: { data: { image: GalleryImage } }) => {
          this.currentImage = response.data.image;
          this.populateForm(response.data.image);
          this.isLoadingInitial = false;
        },
        error: (error: any) => {
          console.error('Failed to load gallery image', error);
          this.error = error.message || 'Failed to load gallery image';
          this.isLoadingInitial = false;
        }
      });
  }

  populateForm(image: GalleryImage): void {
    this.editForm.patchValue({
      alt_text: image.alt_text || '',
      caption: image.caption || '',
      order_index: image.order_index,
      is_featured: image.is_featured,
      is_active: image.is_active
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData = { ...this.editForm.value };

    // Remove empty optional fields
    Object.keys(formData).forEach(key => {
      if (formData[key] === '') {
        formData[key] = null;
      }
    });

    const updateData: UpdateGalleryRequest = {
      alt_text: formData.alt_text,
      caption: formData.caption,
      order_index: formData.order_index,
      is_featured: formData.is_featured,
      is_active: formData.is_active
    };

    this.apiService.put(`/gallery/${this.imageId}`, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedImage: any) => {
          console.log('Gallery image updated successfully', updatedImage);
          this.router.navigate(['/admin/gallery']);
        },
        error: (error: any) => {
          console.error('Failed to update gallery image', error);
          this.error = error.message || 'Failed to update gallery image';
          this.isLoading = false;
        }
      });
  }

  deleteImage(): void {
    if (!this.currentImage) return;
    
    const confirmMessage = `Are you sure you want to delete "${this.currentImage.original_filename}"? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.apiService.delete(`/gallery/${this.imageId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Gallery image deleted successfully');
          this.router.navigate(['/admin/gallery']);
        },
        error: (error: any) => {
          console.error('Failed to delete gallery image', error);
          this.error = error.message || 'Failed to delete gallery image';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/gallery']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
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
      if (field.errors['min']) {
        return `${this.getFieldDisplayName(fieldName)} must be 0 or greater`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      alt_text: 'Alt Text',
      caption: 'Caption',
      order_index: 'Order Index',
      is_featured: 'Featured',
      is_active: 'Active'
    };
    return displayNames[fieldName] || fieldName;
  }

  getImageDisplayName(): string {
    if (!this.currentImage) return 'Gallery Image';
    return this.currentImage.original_filename;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}