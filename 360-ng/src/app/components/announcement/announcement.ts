import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, BehaviorSubject, interval, timer } from 'rxjs';
import { takeUntil, switchMap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Announcement as AnnouncementData } from '../../interfaces/api';

interface HourEntry {
  day: string;
  hours: string;
  isToday?: boolean;
}

interface CarouselState {
  currentIndex: number;
  totalItems: number;
  autoPlay: boolean;
  intervalId?: number;
  progressPercent: number;
  isHovered: boolean;
}

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.html',
  styleUrls: ['./announcement.scss'],
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('slideInLeft', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('600ms 200ms ease-out')
      ])
    ]),
    trigger('slideInRight', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('600ms 400ms ease-out')
      ])
    ]),
    trigger('scaleIn', [
      state('in', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('600ms 100ms ease-out')
      ])
    ]),
    trigger('slideCarousel', [
      transition('* => *', [
        animate('500ms ease-in-out')
      ])
    ]),
    trigger('fadeSlide', [
      state('active', style({ opacity: 1, transform: 'translateX(0)' })),
      state('inactive', style({ opacity: 0, transform: 'translateX(100%)' })),
      transition('active <=> inactive', animate('500ms ease-in-out'))
    ])
  ]
})
export class Announcement implements OnInit, OnDestroy {
  animationState = 'in';
  
  // Announcements data
  announcements: AnnouncementData[] = [];
  isLoading = true;
  hasError = false;
  errorMessage = '';
  
  // Carousel state
  carousel: CarouselState = {
    currentIndex: 0,
    totalItems: 0,
    autoPlay: true,
    progressPercent: 0,
    isHovered: false
  };
  
  // Progress tracking
  private readonly CAROUSEL_DURATION = 5000; // 5 seconds
  private readonly PROGRESS_UPDATE_INTERVAL = 50; // Update every 50ms for smooth animation
  private progressTimer$ = new Subject<void>();
  
  // RxJS subjects for cleanup
  private destroy$ = new Subject<void>();
  private carouselTimer$ = new BehaviorSubject<boolean>(true);
  
  gymHours: HourEntry[] = [
    { day: 'Mon-Thu', hours: '9:00 AM – 9:00 PM' },
    { day: 'Friday', hours: '9:00 AM – 8:30 PM' },
    { day: 'Saturday', hours: '9:00 AM – 4:00 PM' },
    { day: 'Sunday', hours: 'Parties by Request' }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.setTodayFlag();
    this.loadActiveAnnouncements();
    this.setupCarouselAutoPlay();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.carouselTimer$.complete();
    this.progressTimer$.next();
    this.progressTimer$.complete();
    this.stopCarouselAutoPlay();
  }

  private setTodayFlag(): void {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    this.gymHours.forEach(entry => {
      entry.isToday = false;
      
      if (entry.day === 'Mon-Thu' && today >= 1 && today <= 4) {
        entry.isToday = true;
      } else if (entry.day === 'Friday' && today === 5) {
        entry.isToday = true;
      } else if (entry.day === 'Saturday' && today === 6) {
        entry.isToday = true;
      } else if (entry.day === 'Sunday' && today === 0) {
        entry.isToday = true;
      }
    });
  }

  /**
   * Load active announcements from API
   */
  private loadActiveAnnouncements(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.apiService.getActiveAnnouncements(10)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Failed to load announcements:', error);
          this.hasError = true;
          this.errorMessage = 'Failed to load announcements. Please try again later.';
          return of([]);
        })
      )
      .subscribe({
        next: (announcements: any) => {
          console.log('Announcements loaded:', announcements)
          this.announcements = announcements.announcements;
          this.carousel.totalItems = announcements.length;
          this.isLoading = false;
          
          // Reset carousel if announcements changed
          if (this.carousel.currentIndex >= announcements.length) {
            this.carousel.currentIndex = 0;
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  /**
   * Setup automatic carousel rotation with progress tracking
   */
  private setupCarouselAutoPlay(): void {
    if (this.carousel.autoPlay && this.announcements.length > 1) {
      this.startProgressTimer();
    }
  }

  /**
   * Start progress timer for smooth progress bar animation
   */
  private startProgressTimer(): void {
    this.carousel.progressPercent = 0;
    
    // Create a timer that updates progress every PROGRESS_UPDATE_INTERVAL
    const progressSteps = this.CAROUSEL_DURATION / this.PROGRESS_UPDATE_INTERVAL;
    const progressIncrement = 100 / progressSteps;
    
    interval(this.PROGRESS_UPDATE_INTERVAL)
      .pipe(
        takeUntil(this.progressTimer$),
        takeUntil(this.destroy$),
        map((step) => {
          if (this.carousel.isHovered) {
            return this.carousel.progressPercent; // Pause progress when hovered
          }
          return Math.min(100, (step + 1) * progressIncrement);
        })
      )
      .subscribe(progress => {
        this.carousel.progressPercent = progress;
        
        // Auto-advance when progress reaches 100%
        if (progress >= 100 && !this.carousel.isHovered) {
          this.nextSlide();
        }
      });
  }

  /**
   * Reset progress timer
   */
  private resetProgressTimer(): void {
    this.progressTimer$.next();
    if (this.carousel.autoPlay && this.announcements.length > 1) {
      this.startProgressTimer();
    }
  }

  /**
   * Stop carousel auto-play
   */
  private stopCarouselAutoPlay(): void {
    this.carousel.autoPlay = false;
    if (this.carousel.intervalId) {
      clearInterval(this.carousel.intervalId);
    }
  }

  /**
   * Navigate to next carousel slide
   */
  nextSlide(): void {
    if (this.announcements.length > 1) {
      this.carousel.currentIndex = (this.carousel.currentIndex + 1) % this.announcements.length;
      this.resetProgressTimer();
    }
  }

  /**
   * Navigate to previous carousel slide
   */
  prevSlide(): void {
    if (this.announcements.length > 1) {
      this.carousel.currentIndex = this.carousel.currentIndex === 0 
        ? this.announcements.length - 1 
        : this.carousel.currentIndex - 1;
      this.resetProgressTimer();
    }
  }

  /**
   * Navigate to specific carousel slide
   */
  goToSlide(index: number): void {
    if (index >= 0 && index < this.announcements.length) {
      this.carousel.currentIndex = index;
      this.resetProgressTimer();
    }
  }

  /**
   * Get current announcement for display
   */
  getCurrentAnnouncement(): AnnouncementData | null {
    if (this.announcements.length > 0 && this.carousel.currentIndex < this.announcements.length) {
      return this.announcements[this.carousel.currentIndex];
    }
    return null;
  }

  /**
   * Get priority color class
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }

  /**
   * Get priority background color class
   */
  getPriorityBackground(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-red-100';
      case 'high': return 'bg-orange-100';
      case 'medium': return 'bg-yellow-100';
      case 'low': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  }

  /**
   * Get type icon
   */
  getTypeIcon(type: string): string {
    switch (type) {
      case 'class': return 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z';
      case 'maintenance': return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z';
      case 'general': 
      default: return 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z';
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Retry loading announcements
   */
  retryLoad(): void {
    this.loadActiveAnnouncements();
  }

  /**
   * Toggle carousel auto-play
   */
  toggleAutoPlay(): void {
    this.carousel.autoPlay = !this.carousel.autoPlay;
    if (this.carousel.autoPlay) {
      this.setupCarouselAutoPlay();
    } else {
      this.stopCarouselAutoPlay();
    }
  }

  /**
   * Handle mouse enter on carousel
   */
  onCarouselMouseEnter(): void {
    this.carousel.isHovered = true;
  }

  /**
   * Handle mouse leave on carousel
   */
  onCarouselMouseLeave(): void {
    this.carousel.isHovered = false;
  }
}