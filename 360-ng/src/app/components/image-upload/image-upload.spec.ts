import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { ImageUploadComponent } from './image-upload';
import { ApiService } from '../../services/api.service';
import { PhotoUploadResponse } from '../../interfaces/api';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockPhotoUploadResponse: PhotoUploadResponse = {
    original_url: 'http://localhost:8080/api/v1/files/staff/test.jpg',
    thumbnail_url: 'http://localhost:8080/api/v1/files/staff/thumbnails/test.jpg',
    filename: 'test.jpg'
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'uploadStaffPhoto',
      'deleteStaffPhoto'
    ]);

    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent, HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.accept).toBe('image/jpeg,image/jpg,image/png,image/webp');
    expect(component.maxSizeBytes).toBe(5 * 1024 * 1024);
    expect(component.minWidth).toBe(200);
    expect(component.minHeight).toBe(200);
    expect(component.showPreview).toBe(true);
    expect(component.allowDelete).toBe(true);
  });

  it('should handle string value in writeValue', () => {
    const testUrl = 'https://example.com/image.jpg';
    component.writeValue(testUrl);
    
    expect(component.currentValue).toEqual({
      url: testUrl,
      isLocal: false
    });
  });

  it('should handle object value in writeValue', () => {
    const testValue = {
      url: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      filename: 'image.jpg',
      isLocal: true
    };
    
    component.writeValue(testValue);
    expect(component.currentValue).toEqual(testValue);
  });

  it('should handle null value in writeValue', () => {
    component.writeValue(null);
    expect(component.currentValue).toBeNull();
  });

  it('should set drag over state on dragover', () => {
    const event = new DragEvent('dragover');
    spyOn(event, 'preventDefault');
    spyOn(event, 'stopPropagation');
    
    component.onDragOver(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isDragOver).toBe(true);
  });

  it('should clear drag over state on dragleave', () => {
    component.isDragOver = true;
    const event = new DragEvent('dragleave');
    spyOn(event, 'preventDefault');
    spyOn(event, 'stopPropagation');
    
    component.onDragLeave(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isDragOver).toBe(false);
  });

  it('should validate file size', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB
    
    const result = component['validateFile'](file);
    
    expect(result).toBe(false);
    expect(component.validationErrors.length).toBeGreaterThan(0);
    expect(component.validationErrors[0]).toContain('File size exceeds');
  });

  it('should validate file type', () => {
    const file = new File([''], 'test.gif', { type: 'image/gif' });
    
    const result = component['validateFile'](file);
    
    expect(result).toBe(false);
    expect(component.validationErrors.length).toBeGreaterThan(0);
    expect(component.validationErrors[0]).toContain('File type');
  });

  it('should upload file successfully', () => {
    component.userId = 123;
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    apiService.uploadStaffPhoto.and.returnValue(of(mockPhotoUploadResponse));
    
    spyOn(component.uploadSuccess, 'emit');
    spyOn(component, 'onChange');
    
    component['uploadFile'](file);
    
    expect(apiService.uploadStaffPhoto).toHaveBeenCalledWith(123, file);
    expect(component.uploadSuccess.emit).toHaveBeenCalledWith(mockPhotoUploadResponse);
    expect(component.onChange).toHaveBeenCalled();
    expect(component.isUploading).toBe(false);
  });

  it('should handle upload error', () => {
    component.userId = 123;
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const errorMessage = 'Upload failed';
    apiService.uploadStaffPhoto.and.returnValue(throwError({ message: errorMessage }));
    
    spyOn(component.uploadError, 'emit');
    
    component['uploadFile'](file);
    
    expect(component.uploadError.emit).toHaveBeenCalledWith(errorMessage);
    expect(component.error).toBe(errorMessage);
    expect(component.isUploading).toBe(false);
  });

  it('should delete photo successfully', () => {
    component.userId = 123;
    component.currentValue = {
      url: 'test.jpg',
      isLocal: true
    };
    apiService.deleteStaffPhoto.and.returnValue(of(undefined));
    
    spyOn(component.deleteSuccess, 'emit');
    spyOn(component, 'onChange');
    
    component.onDeletePhoto();
    
    expect(apiService.deleteStaffPhoto).toHaveBeenCalledWith(123);
    expect(component.deleteSuccess.emit).toHaveBeenCalled();
    expect(component.onChange).toHaveBeenCalledWith(null);
    expect(component.currentValue).toBeNull();
  });

  it('should handle delete error', () => {
    component.userId = 123;
    component.currentValue = {
      url: 'test.jpg',
      isLocal: true
    };
    const errorMessage = 'Delete failed';
    apiService.deleteStaffPhoto.and.returnValue(throwError({ message: errorMessage }));
    
    spyOn(component.uploadError, 'emit');
    
    component.onDeletePhoto();
    
    expect(component.uploadError.emit).toHaveBeenCalledWith(errorMessage);
    expect(component.error).toBe(errorMessage);
    expect(component.isDeleting).toBe(false);
  });

  it('should clear value for non-local images', () => {
    component.currentValue = {
      url: 'https://example.com/image.jpg',
      isLocal: false
    };
    
    spyOn(component, 'onChange');
    
    component.onDeletePhoto();
    
    expect(component.onChange).toHaveBeenCalledWith(null);
    expect(component.currentValue).toBeNull();
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(0)).toBe('0 Bytes');
    expect(component.formatFileSize(1024)).toBe('1 KB');
    expect(component.formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(component.formatFileSize(1536)).toBe('1.5 KB');
  });

  it('should show delete button when appropriate', () => {
    component.allowDelete = true;
    component.currentValue = { url: 'test.jpg', isLocal: true };
    component.isUploading = false;
    
    expect(component.showDeleteButton).toBe(true);
    
    component.isUploading = true;
    expect(component.showDeleteButton).toBe(false);
    
    component.isUploading = false;
    component.currentValue = null;
    expect(component.showDeleteButton).toBe(false);
  });

  it('should identify external URLs correctly', () => {
    component.currentValue = { url: 'https://example.com/image.jpg', isLocal: false };
    expect(component.isExternalUrl).toBe(true);
    
    component.currentValue = { url: 'local-image.jpg', isLocal: true };
    expect(component.isExternalUrl).toBe(false);
  });

  it('should clean up preview URL on destroy', () => {
    component.previewUrl = 'blob:test-url';
    spyOn(URL, 'revokeObjectURL');
    
    component.ngOnDestroy();
    
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });
});