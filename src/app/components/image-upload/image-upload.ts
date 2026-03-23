import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { PhotoUploadResponse } from '../../interfaces/api';

export interface ImageUploadValue {
  url: string;
  thumbnailUrl?: string;
  filename?: string;
  isLocal?: boolean;
}

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.html',
  styleUrls: ['./image-upload.scss'],
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ]
})
export class ImageUploadComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() staffId?: number;
  @Input() accept = 'image/jpeg,image/jpg,image/png,image/webp';
  @Input() maxSizeBytes = 5 * 1024 * 1024; // 5MB
  @Input() minWidth = 200;
  @Input() minHeight = 200;
  @Input() maxWidth = 2000;
  @Input() maxHeight = 2000;
  @Input() showPreview = true;
  @Input() allowDelete = true;
  @Input() label = 'Upload Photo';
  @Input() hint = 'Drag and drop or click to select an image. JPG, PNG, WebP up to 5MB. Minimum 200x200px.';

  @Output() uploadStart = new EventEmitter<void>();
  @Output() uploadSuccess = new EventEmitter<PhotoUploadResponse>();
  @Output() uploadError = new EventEmitter<string>();
  @Output() deleteSuccess = new EventEmitter<void>();

  // Component state
  isDragOver = false;
  isUploading = false;
  isDeleting = false;
  uploadProgress = 0;
  currentValue: ImageUploadValue | null = null;
  previewUrl: string | null = null;
  error: string | null = null;

  // File validation
  validationErrors: string[] = [];

  private destroy$ = new Subject<void>();
  private onChange = (value: ImageUploadValue | null) => {};
  private onTouched = () => {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up preview URL
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: ImageUploadValue | string | null): void {
    if (typeof value === 'string') {
      // Handle legacy avatar_url string values
      this.currentValue = value ? { url: value, isLocal: false } : null;
    } else {
      this.currentValue = value;
    }
    
    this.updatePreview();
  }

  registerOnChange(fn: (value: ImageUploadValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  // Event handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDeletePhoto(): void {
    if (!this.staffId || !this.currentValue?.isLocal) {
      // For non-local images or when no staffId, just clear the value
      this.clearValue();
      return;
    }

    this.isDeleting = true;
    this.error = null;

    this.apiService.deleteStaffPhoto(this.staffId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.clearValue();
          this.deleteSuccess.emit();
          this.isDeleting = false;
        },
        error: (error) => {
          this.error = error.message || 'Failed to delete photo';
          this.uploadError.emit(this.error!);
          this.isDeleting = false;
        }
      });
  }

  // File handling
  private handleFile(file: File): void {
    this.onTouched();
    this.error = null;
    this.validationErrors = [];

    // Validate file
    if (!this.validateFile(file)) {
      return;
    }

    // Create preview
    this.createPreview(file);

    // Upload immediately - use anonymous upload if no staffId provided
    this.uploadFile(file);
  }

  private validateFile(file: File): boolean {
    this.validationErrors = [];

    // Check file type
    const allowedTypes = this.accept.split(',').map(type => type.trim());
    const fileType = file.type;
    
    if (!allowedTypes.includes(fileType) && !allowedTypes.includes('image/*')) {
      this.validationErrors.push(`File type ${fileType} is not allowed. Please use: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > this.maxSizeBytes) {
      const maxSizeMB = Math.round(this.maxSizeBytes / (1024 * 1024));
      this.validationErrors.push(`File size exceeds ${maxSizeMB}MB limit`);
    }

    // Check image dimensions (requires loading the image)
    if (this.validationErrors.length === 0) {
      return this.validateImageDimensions(file);
    }

    if (this.validationErrors.length > 0) {
      this.error = this.validationErrors.join('. ');
      this.uploadError.emit(this.error!);
      return false;
    }

    return true;
  }

  private validateImageDimensions(file: File): boolean {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      
      if (width < this.minWidth || height < this.minHeight) {
        this.validationErrors.push(`Image must be at least ${this.minWidth}x${this.minHeight}px. Current: ${width}x${height}px`);
      }
      
      if (width > this.maxWidth || height > this.maxHeight) {
        this.validationErrors.push(`Image must be no larger than ${this.maxWidth}x${this.maxHeight}px. Current: ${width}x${height}px`);
      }
      
      if (this.validationErrors.length > 0) {
        this.error = this.validationErrors.join('. ');
        this.uploadError.emit(this.error!);
        return;
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      this.error = 'Invalid image file';
      this.uploadError.emit(this.error!);
    };
    
    img.src = url;
    return true; // Async validation, assume valid for now
  }

  private createPreview(file: File): void {
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    
    this.previewUrl = URL.createObjectURL(file);
  }

  private uploadFile(file: File): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadStart.emit();

    // Choose upload method based on whether staffId is provided
    const uploadObservable = this.staffId 
      ? this.apiService.uploadStaffPhoto(this.staffId, file)
      : this.apiService.uploadStaffPhotoAnonymous(file);

    uploadObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PhotoUploadResponse) => {
          this.currentValue = {
            url: response.original_url,
            thumbnailUrl: response.thumbnail_url,
            filename: response.filename,
            isLocal: true
          };
          
          this.onChange(this.currentValue);
          this.uploadSuccess.emit(response);
          this.isUploading = false;
          this.uploadProgress = 100;
        },
        error: (error) => {
          this.error = error.message || 'Upload failed';
          this.uploadError.emit(this.error!);
          this.isUploading = false;
          this.uploadProgress = 0;
        }
      });
  }

  private updatePreview(): void {
    if (this.currentValue?.url) {
      // Use thumbnail for preview if available, otherwise use the main URL
      this.previewUrl = this.currentValue.thumbnailUrl || this.currentValue.url;
    } else {
      this.previewUrl = null;
    }
  }

  private clearValue(): void {
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    
    this.currentValue = null;
    this.previewUrl = null;
    this.error = null;
    this.validationErrors = [];
    this.onChange(null);
  }

  // Template helpers
  get showDeleteButton(): boolean {
    return this.allowDelete && !!this.currentValue && !this.isUploading;
  }

  get isExternalUrl(): boolean {
    return !!this.currentValue && !this.currentValue.isLocal;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}