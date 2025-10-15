import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Banner } from '../../interfaces/api';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss'],
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('fadeInUpDelay', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms 200ms ease-out')
      ])
    ]),
    trigger('fadeInRight', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('600ms 400ms ease-out')
      ])
    ])
  ]
})
export class Hero implements OnInit, OnDestroy {
  animationState = 'in';
  imageLoaded = false;
  imageError = false;
  showVideoModal = false;
  banner: Banner | null = null;
  bannerError = false;

  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadBanner();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBanner(): void {
    this.apiService.getBanner()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (banner) => {
          this.banner = banner;
          this.bannerError = false;
        },
        error: (error) => {
          console.error('Failed to load banner', error);
          this.bannerError = true;
          // Fallback to default banner text if API fails
          this.banner = {
            id: 0,
            text: 'Enrolling for 2025!',
            is_visible: true,
            background_color: '#fc7900',
            created_at: '',
            updated_at: ''
          };
        }
      });
  }

  onImageLoad(): void {
    console.log('Hero image loaded');
    this.imageLoaded = true;
    this.imageError = false;
  }

  onImageError(): void {
    console.log('Hero image error');
    this.imageError = true;
    this.imageLoaded = false;
    console.warn('Failed to load hero image: images/gym1.jpg');
  }

  playVideo(): void {
    this.showVideoModal = true;
  }

  closeVideoModal(): void {
    this.showVideoModal = false;
  }

  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeVideoModal();
    }
  }
}