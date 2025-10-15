import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { InstagramService } from '../../services/instagram.service';
import { ProcessedInstagramPost } from '../../interfaces/instagram';

// Interface moved to instagram.ts for better organization

@Component({
  selector: 'app-social-feed',
  templateUrl: './social-feed.html',
  styleUrls: ['./social-feed.scss'],
  imports: [CommonModule],
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
        animate('600ms 300ms ease-out')
      ])
    ]),
    trigger('slideInLeft', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('600ms 500ms ease-out')
      ])
    ])
  ]
})
export class SocialFeed implements OnInit, OnDestroy {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  
  private destroy$ = new Subject<void>();
  
  animationState = 'in';
  canScrollLeft = false;
  canScrollRight = true;
  Math = Math; // Expose Math to the template
  
  // Instagram data
  instagramPosts: ProcessedInstagramPost[] = [];
  isLoading = false;
  error: string | null = null;
  
  constructor(private instagramService: InstagramService) {}
  

  ngOnInit(): void {
    // Subscribe to Instagram service observables
    this.instagramService.posts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(posts => {
        this.instagramPosts = posts;
        // Update scroll buttons after posts are loaded
        setTimeout(() => {
          this.updateScrollButtons();
        }, 100);
      });

    this.instagramService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });

    this.instagramService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.error = error;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scrollLeft(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollBy({
      left: -300,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      this.updateScrollButtons();
    }, 300);
  }

  scrollRight(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollBy({
      left: 300,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      this.updateScrollButtons();
    }, 300);
  }

  onScroll(): void {
    this.updateScrollButtons();
  }

  private updateScrollButtons(): void {
    if (!this.scrollContainer) return;
    
    const container = this.scrollContainer.nativeElement;
    this.canScrollLeft = container.scrollLeft > 0;
    this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/400x400/9333ea/ffffff?text=360+Gym';
  }

  openInstagramPost(link: string): void {
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  getCarouselIconPath(): string {
    return 'M464 0H144c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h320c26.51 0 48-21.49 48-48v-48h48c26.51 0 48-21.49 48-48V48c0-26.51-21.49-48-48-48zM362 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h42v224c0 26.51 21.49 48 48 48h224v42a6 6 0 0 1-6 6zm96-96H150a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h308a6 6 0 0 1 6 6v308a6 6 0 0 1-6 6z';
  }

  getVideoIconPath(): string {
    return 'M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z';
  }

  getInstagramIconPath(): string {
    return 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z M12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm5.338-9.87a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z';
  }

  /**
   * Get the Instagram account URL
   */
  getInstagramUrl(): string {
    return this.instagramService.getAccountUrl();
  }

  /**
   * Retry loading Instagram posts
   */
  retryLoadPosts(): void {
    this.instagramService.retryLoadPosts();
  }

  /**
   * Get relative time string
   */
  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByPostId(_index: number, post: ProcessedInstagramPost): string {
    return post.id;
  }
}