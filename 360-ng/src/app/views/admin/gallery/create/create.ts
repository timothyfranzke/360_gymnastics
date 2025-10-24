import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';

interface GalleryUploadResponse {
  image: {
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
    url: string;
    thumbnail_url: string;
    created_at: string;
  };
  upload_info: {
    original_url: string;
    thumbnail_url: string;
    size: number;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

@Component({
  selector: 'app-gallery-create',
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class GalleryCreate implements OnInit, OnDestroy {
  uploadForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  
  // File upload state
  selectedFiles: FileList | null = null;
  uploadProgress: { [key: string]: number } = {};
  uploadErrors: { [key: string]: string } = {};
  uploadedImages: GalleryUploadResponse[] = [];
  isUploading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.uploadForm = this.fb.group({
      files: [null, [Validators.required]],
      is_featured: [false],
      order_index: [null]
    });
  }

  ngOnInit(): void {
    // No specific initialization needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    
    if (files && files.length > 0) {
      this.selectedFiles = files;
      this.uploadForm.patchValue({ files: files });
      this.validateFiles(files);
    }
  }

  private validateFiles(files: FileList): void {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    this.error = null;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!allowedTypes.includes(file.type)) {
        this.error = `File "${file.name}" is not a supported image type. Allowed types: JPEG, PNG, WebP`;
        return;
      }
      
      if (file.size > maxSize) {
        this.error = `File "${file.name}" is too large. Maximum size is 5MB`;
        return;
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.uploadForm.invalid || !this.selectedFiles) {
      this.markFormGroupTouched();
      return;
    }

    this.isUploading = true;
    this.error = null;
    this.uploadedImages = [];
    this.uploadProgress = {};
    this.uploadErrors = {};

    const formData = this.uploadForm.value;
    
    // Upload files one by one to track progress
    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles[i];
      await this.uploadSingleFile(file, formData, i);
    }
    
    this.isUploading = false;
    
    // If all uploads successful, redirect to gallery list
    if (this.uploadedImages.length === this.selectedFiles.length) {
      this.router.navigate(['/admin/gallery']);
    }
  }

  private uploadSingleFile(file: File, formData: any, index: number): Promise<void> {
    const fileKey = `${file.name}_${index}`;
    this.uploadProgress[fileKey] = 0;
    
    return new Promise((resolve, reject) => {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      
      // Add optional metadata
      if (formData.is_featured) {
        uploadFormData.append('is_featured', 'true');
      }
      
      if (formData.order_index !== null && formData.order_index !== '') {
        uploadFormData.append('order_index', formData.order_index.toString());
      }

      // Upload using the API service
      this.apiService.post<GalleryUploadResponse>('/gallery/upload', uploadFormData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.uploadProgress[fileKey] = 100;
            this.uploadedImages.push(response);
            console.log(`Successfully uploaded ${file.name}`, response);
            resolve();
          },
          error: (error: any) => {
            console.error(`Failed to upload ${file.name}`, error);
            this.uploadErrors[fileKey] = error.message || 'Upload failed';
            resolve(); // Resolve instead of reject to continue with other uploads
          }
        });
    });
  }

  removeFile(index: number): void {
    if (this.selectedFiles) {
      const dt = new DataTransfer();
      const files = Array.from(this.selectedFiles);
      
      files.splice(index, 1);
      
      files.forEach(file => dt.items.add(file));
      this.selectedFiles = dt.files;
      
      if (this.selectedFiles.length === 0) {
        this.uploadForm.patchValue({ files: null });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/gallery']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.uploadForm.controls).forEach(key => {
      const control = this.uploadForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.uploadForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.uploadForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      files: 'Files',
      is_featured: 'Featured',
      order_index: 'Order Index'
    };
    return displayNames[fieldName] || fieldName;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getSelectedFilesArray(): File[] {
    return this.selectedFiles ? Array.from(this.selectedFiles) : [];
  }

  getUploadProgress(file: File, index: number): number {
    const fileKey = `${file.name}_${index}`;
    return this.uploadProgress[fileKey] || 0;
  }

  getUploadError(file: File, index: number): string | null {
    const fileKey = `${file.name}_${index}`;
    return this.uploadErrors[fileKey] || null;
  }

  hasUploadError(file: File, index: number): boolean {
    const fileKey = `${file.name}_${index}`;
    return !!this.uploadErrors[fileKey];
  }

  isUploadComplete(file: File, index: number): boolean {
    const fileKey = `${file.name}_${index}`;
    return this.uploadProgress[fileKey] === 100 && !this.uploadErrors[fileKey];
  }
}