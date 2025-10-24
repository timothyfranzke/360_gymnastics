import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { GalleryImage } from '../../interfaces/api';

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
    ])
  ]
})
export class Gallery implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  images: GalleryImage[] = [];
  loading = true;
  error: string | null = null;
  animationState = 'in';

  constructor() {}

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

    // Simulate API call with mock data
    setTimeout(() => {
      this.images = this.getMockGalleryImages();
      this.loading = false;
    }, 800);
  }

  private getMockGalleryImages(): GalleryImage[] {
    return [
      {
        id: 1,
        filename: 'gym-action-1.jpg',
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

  retryLoad(): void {
    this.loadGalleryImages();
  }

  trackByImageId(_index: number, image: GalleryImage): number {
    return image.id;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/api/placeholder/400/500';
  }
}
