import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { GalleryImage } from '../../interfaces/api';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('popupAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('imageSlide', [
      transition('* => left', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition('* => right', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition('* => none', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class Gallery implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  images: GalleryImage[] = [];
  loading = true;
  error: string | null = null;
  animationState = 'in';
  
  // Popup state
  showPopup = false;
  currentImageIndex = 0;
  slideDirection: 'left' | 'right' | 'none' = 'none';
  
  // Touch gesture tracking
  private touchStartX = 0;
  private touchStartY = 0;
  private minSwipeDistance = 50;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadGalleryImages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadGalleryImages(): void {
    this.loading = true;
    this.error = null;

    // Use real API to get gallery images ordered by order_index
    this.apiService.get<any>('/gallery?featured=true&limit=20')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.images = response.data?.images || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load gallery images:', error);
          this.error = 'Failed to load gallery images. Please try again later.';
          this.loading = false;
        }
      });
  }

  private getMockGalleryImages(): GalleryImage[] {
    return [
      {
        id: 1,
        filename: 'gym-action-1.jpg',
        file_path: 'uploads/gallery/5fd7e362-a4d6-4877-8ccd-08bc7dd3b0bf.jpg',
        alt_text: 'Gymnast performing on balance beam',
        caption: 'Focus and determination in action',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-15T10:30:00Z',
        order_index: 1
      },
      {
        id: 2,
        filename: 'gym-team-1.jpg',
        file_path: 'uploads/gallery/2a8f9b3c-1e4d-4c7a-9f2b-1a3e5c7d9f2b.jpg',
        alt_text: 'Team training session',
        caption: 'Building skills together',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-14T15:45:00Z',
        order_index: 2
      },
      {
        id: 3,
        filename: 'gym-vault-1.jpg',
        file_path: 'uploads/gallery/8e1c3f5a-6b2d-4a9e-8c1f-3a5e7c9d1f3a.jpg',
        alt_text: 'Athlete performing vault',
        caption: 'Soaring to new heights',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-13T09:20:00Z',
        order_index: 3
      },
      {
        id: 4,
        filename: 'gym-floor-1.jpg',
        alt_text: 'Floor routine performance',
        caption: 'Grace and power combined',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-12T14:15:00Z',
        order_index: 4
      },
      {
        id: 5,
        filename: 'gym-bars-1.jpg',
        alt_text: 'Uneven bars routine',
        caption: 'Strength meets artistry',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-11T11:30:00Z',
        order_index: 5
      },
      {
        id: 6,
        filename: 'gym-kids-1.jpg',
        alt_text: 'Young gymnasts learning',
        caption: 'Starting the journey young',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-10T16:20:00Z',
        order_index: 6
      },
      {
        id: 7,
        filename: 'gym-competition-1.jpg',
        alt_text: 'Competition performance',
        caption: 'Competing at the highest level',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-09T13:45:00Z',
        order_index: 7
      },
      {
        id: 8,
        filename: 'gym-coaching-1.jpg',
        alt_text: 'Coach working with athlete',
        caption: 'Expert guidance every step',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-08T10:15:00Z',
        order_index: 8
      },
      {
        id: 9,
        filename: 'gym-beam-2.jpg',
        alt_text: 'Balance beam routine',
        caption: 'Perfect balance and poise',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-07T14:30:00Z',
        order_index: 9
      },
      {
        id: 10,
        filename: 'gym-parallel-bars.jpg',
        alt_text: 'Parallel bars routine',
        caption: 'Strength in motion',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-06T12:00:00Z',
        order_index: 10
      },
      {
        id: 11,
        filename: 'gym-rings-1.jpg',
        alt_text: 'Still rings performance',
        caption: 'Upper body power display',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-05T15:15:00Z',
        order_index: 11
      },
      {
        id: 12,
        filename: 'gym-celebration-1.jpg',
        alt_text: 'Team celebrating success',
        caption: 'Celebrating achievements together',
        url: '/api/placeholder/400/500',
        thumbnail_url: '/api/placeholder/300/375',
        created_at: '2024-01-04T17:45:00Z',
        order_index: 12
      }
    ];
  }

  getRotationClass(index: number): string {
    return index % 2 === 0 ? 'rotate-2' : '-rotate-2';
  }

  getImageThumbnailUrl(image: GalleryImage): string {
    return this.apiService.getGalleryThumbnailUrl(image.filename);
  }

  retryLoad(): void {
    this.loadGalleryImages();
  }

  trackByImageId(_index: number, image: GalleryImage): number {
    return image.id;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  // Popup functionality
  openPopup(index: number): void {
    this.currentImageIndex = index;
    this.showPopup = true;
    this.slideDirection = 'none';
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  }

  closePopup(): void {
    this.showPopup = false;
    document.body.style.overflow = ''; // Restore body scroll
  }

  previousImage(event: Event): void {
    event.stopPropagation();
    if (this.currentImageIndex > 0) {
      this.slideDirection = 'right';
      this.currentImageIndex--;
    }
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    if (this.currentImageIndex < this.images.length - 1) {
      this.slideDirection = 'left';
      this.currentImageIndex++;
    }
  }

  getImageFullUrl(image: GalleryImage): string {
    // Use file_path if available (which includes the full path like uploads/gallery/filename.jpg)
    // Otherwise fall back to filename for backwards compatibility
    const imagePath = image.file_path || image.filename;
    
    // If file_path is used, it already includes the full path from the uploads directory
    if (image.file_path) {
      return `${this.apiService.getFileBaseUrl()}/files/${imagePath}`;
    } else {
      // Use the standard gallery image URL method for filename
      return this.apiService.getGalleryImageUrl(imagePath);
    }
  }

  // Touch gesture handling
  onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    if (!event.changedTouches.length) return;
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    
    // Only handle horizontal swipes if they're more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
      event.preventDefault();
      event.stopPropagation();
      
      if (deltaX > 0) {
        // Swipe right - go to previous image
        this.previousImage(event);
      } else {
        // Swipe left - go to next image
        this.nextImage(event);
      }
    }
  }

  // Keyboard navigation
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.showPopup) return;

    switch (event.key) {
      case 'Escape':
        this.closePopup();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previousImage(event);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage(event);
        break;
    }
  }
}
