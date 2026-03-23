import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';

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
  screenAssignments?: ScreenAssignment[];
}

interface ScreenAssignment {
  id: number;
  screen_key: string;
  position_key: string;
  is_active: boolean;
}

interface ScreenPosition {
  key: string;
  label: string;
}

interface PaginatedGalleryResponse {
  data: {
    images: GalleryImage[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      offset: number;
      total_pages: number;
    };
  };
}

@Component({
  selector: 'app-gallery-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DragDropModule]
})
export class GalleryList implements OnInit, OnDestroy {
  images: GalleryImage[] = [];
  isLoading = true;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 12;

  // Filters
  filterForm: FormGroup;

  Math = Math;

  // Drag and drop state
  isReordering = false;

  // Screen assignment
  screenPositions: Record<string, ScreenPosition[]> = {
    parties: [
      { key: 'parties-1', label: 'Private Party Image' },
      { key: 'parties-2', label: 'Open Gym Party Image' }
    ],
    camps: [
      { key: 'camps-1', label: 'Camps Hero Image' },
      { key: 'camps-2', label: 'Camps Section Image' }
    ],
    home: [
      { key: 'home-1', label: 'Home Featured 1' },
      { key: 'home-2', label: 'Home Featured 2' },
      { key: 'home-3', label: 'Home Featured 3' }
    ]
  };
  activeDropdownId: number | null = null;
  assigningImageId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      featured: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    // Setup filter form changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadImages();
      });

    this.loadImages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadImages(): void {
    this.isLoading = true;
    this.error = null;

    const params = new URLSearchParams();
    params.append('page', this.currentPage.toString());
    params.append('limit', this.itemsPerPage.toString());
    
    const filters = this.filterForm.value;
    if (filters.featured && filters.featured !== '') {
      params.append('featured', filters.featured);
    }
    
    // Simple search filter (could be expanded)
    if (filters.search && filters.search.trim()) {
      // Note: This would require backend search implementation
      console.log('Search functionality not yet implemented:', filters.search);
    }

    this.apiService.get<PaginatedGalleryResponse>(`/gallery?${params.toString()}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedGalleryResponse) => {
          this.images = response.data.images || [];
          this.totalItems = response.data.total || 0;
          this.currentPage = response.data.pagination?.page || 1;
          this.totalPages = response.data.pagination?.total_pages || 1;
          this.isLoading = false;
          
          // Debug: Log filenames to verify only GUID filenames are returned
          console.log('Gallery images loaded:', this.images.map(img => ({
            id: img.id,
            filename: img.filename,
            original_filename: img.original_filename,
            isGuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\./.test(img.filename)
          })));
        },
        error: (error: any) => {
          console.error('Failed to load gallery images', error);
          this.error = error.message || 'Failed to load gallery images';
          this.images = [];
          this.isLoading = false;
        }
      });
  }

  getImageThumbnailUrl(image: GalleryImage): string {
    return this.apiService.getGalleryThumbnailUrl(image.filename);
  }

  getImageUrl(image: GalleryImage): string {
    return this.apiService.getGalleryImageUrl(image.filename);
  }

  deleteImage(image: GalleryImage): void {
    if (!confirm(`Are you sure you want to delete "${image.original_filename}"? This action cannot be undone.`)) {
      return;
    }

    this.apiService.delete(`/gallery/${image.id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadImages(); // Reload the list
        },
        error: (error: any) => {
          console.error('Failed to delete image', error);
          alert('Failed to delete image: ' + (error.message || 'Unknown error'));
        }
      });
  }

  toggleFeatured(image: GalleryImage): void {
    const updatedData = { is_featured: !image.is_featured };
    
    this.apiService.put(`/gallery/${image.id}`, updatedData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          image.is_featured = !image.is_featured;
        },
        error: (error: any) => {
          console.error('Failed to update featured status', error);
          alert('Failed to update featured status: ' + (error.message || 'Unknown error'));
        }
      });
  }

  toggleActive(image: GalleryImage): void {
    const updatedData = { is_active: !image.is_active };
    
    this.apiService.put(`/gallery/${image.id}`, updatedData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          image.is_active = !image.is_active;
        },
        error: (error: any) => {
          console.error('Failed to update active status', error);
          alert('Failed to update active status: ' + (error.message || 'Unknown error'));
        }
      });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadImages();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadImages();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const end = Math.min(this.totalPages, start + maxPages - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  trackByImageId(index: number, image: GalleryImage): number {
    return image.id;
  }

  // Drag and drop functionality
  drop(event: CdkDragDrop<GalleryImage[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      // Update local array order
      moveItemInArray(this.images, event.previousIndex, event.currentIndex);
      
      // Update order_index for all images based on new positions
      const pageOffset = (this.currentPage - 1) * this.itemsPerPage;
      this.images.forEach((image, index) => {
        image.order_index = pageOffset + index;
      });
      
      // Save new order to API
      this.saveImageOrder();
    }
  }

  private saveImageOrder(): void {
    this.isReordering = true;

    // Create order mapping: image_id -> new_order_index
    const pageOffset = (this.currentPage - 1) * this.itemsPerPage;
    const imageOrders: { [key: number]: number } = {};
    this.images.forEach((image, index) => {
      imageOrders[image.id] = pageOffset + index;
    });

    this.apiService.post('/gallery/reorder', { image_orders: imageOrders })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isReordering = false;
          console.log('Image order updated successfully');
        },
        error: (error: any) => {
          console.error('Failed to update image order:', error);
          this.isReordering = false;
          // Reload images to restore original order on error
          this.loadImages();
        }
      });
  }

  // Screen assignment methods
  toggleScreenDropdown(imageId: number, event: Event): void {
    event.stopPropagation();
    if (this.activeDropdownId === imageId) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = imageId;
      // Load current assignments for this image
      this.loadImageAssignments(imageId);
    }
  }

  closeScreenDropdown(): void {
    this.activeDropdownId = null;
  }

  loadImageAssignments(imageId: number): void {
    this.apiService.getGalleryScreenAssignments(imageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const image = this.images.find(img => img.id === imageId);
          if (image) {
            image.screenAssignments = response.assignments;
          }
        },
        error: (error) => {
          console.error('Failed to load image assignments:', error);
        }
      });
  }

  isAssignedToPosition(image: GalleryImage, positionKey: string): boolean {
    return image.screenAssignments?.some(a => a.position_key === positionKey) || false;
  }

  assignToScreen(image: GalleryImage, screenKey: string, positionKey: string, event: Event): void {
    event.stopPropagation();
    this.assigningImageId = image.id;

    this.apiService.assignScreenImage({
      screen_key: screenKey,
      position_key: positionKey,
      gallery_id: image.id
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.assigningImageId = null;
          this.loadImageAssignments(image.id);
          // Show success message
          console.log(`Image assigned to ${positionKey}`);
        },
        error: (error: any) => {
          this.assigningImageId = null;
          console.error('Failed to assign image:', error);
          alert('Failed to assign image: ' + (error.message || 'Unknown error'));
        }
      });
  }

  removeFromScreen(image: GalleryImage, positionKey: string, event: Event): void {
    event.stopPropagation();
    const assignment = image.screenAssignments?.find(a => a.position_key === positionKey);
    if (!assignment) return;

    this.assigningImageId = image.id;

    this.apiService.removeScreenImage(assignment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.assigningImageId = null;
          this.loadImageAssignments(image.id);
          console.log(`Image removed from ${positionKey}`);
        },
        error: (error: any) => {
          this.assigningImageId = null;
          console.error('Failed to remove assignment:', error);
          alert('Failed to remove assignment: ' + (error.message || 'Unknown error'));
        }
      });
  }

  getScreenKeys(): string[] {
    return Object.keys(this.screenPositions);
  }

  formatScreenName(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }
}