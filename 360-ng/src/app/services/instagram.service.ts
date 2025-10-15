import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  InstagramMediaData, 
  ProcessedInstagramPost, 
  InstagramConfig
} from '../interfaces/instagram';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private readonly INSTAGRAM_BASE_URL = 'https://graph.instagram.com';
  private readonly INSTAGRAM_BASIC_URL = 'https://graph.instagram.com';
  
  // Configuration for the Instagram account
  private config: InstagramConfig = {
    accountUsername: 'kc360gym',
    // Fallback posts when API is not available
    fallbackPosts: [
      {
        id: '1',
        imageUrl: '/images/social/post1.jpg',
        text: '🗣️ JUNE CLINICS 📢 Register Online Now! Check out our latest clinic schedules and get ready for an amazing month of training.',
        link: 'https://www.instagram.com/p/DJj8rX4JPb0/',
        isCarousel: false,
        isVideo: false,
        timestamp: new Date('2024-01-15'),
        likesCount: 45,
        commentsCount: 8
      },
      {
        id: '2',
        imageUrl: '/images/social/post2.jpg',
        text: 'Spring Cleaning🧽🫧🆕 Time to refresh our training space and get ready for new adventures in gymnastics!',
        link: 'https://www.instagram.com/p/DJerA_7OE3X/',
        isCarousel: true,
        isVideo: false,
        timestamp: new Date('2024-01-12'),
        likesCount: 67,
        commentsCount: 12
      },
      {
        id: '3',
        imageUrl: '/images/social/post3.jpg',
        text: '☀️SuMmEr CaMp ViBeS 💪 DM us for the direct registration link! Our summer camps are filling up fast.',
        link: 'https://www.instagram.com/p/DJS2uM7RB42/',
        isCarousel: false,
        isVideo: false,
        timestamp: new Date('2024-01-10'),
        likesCount: 89,
        commentsCount: 15
      },
      {
        id: '4',
        imageUrl: '/images/social/post4.jpg',
        text: '🗣️ UPCOMING EVENTS! 📌 WWW.360GYM.COM Visit our website for the complete list of upcoming events and competitions.',
        link: 'https://www.instagram.com/p/DJJ224eRTkg/',
        isCarousel: false,
        isVideo: false,
        timestamp: new Date('2024-01-08'),
        likesCount: 52,
        commentsCount: 9
      },
      {
        id: '5',
        imageUrl: '/images/social/post5.jpg',
        text: '🌟 MAY FUNDRAISER ALERT! 🌟 Donate to the coaches\'s box! Help us support our amazing coaching staff.',
        link: 'https://www.instagram.com/p/DJF1flFvxv4/',
        isCarousel: false,
        isVideo: false,
        timestamp: new Date('2024-01-05'),
        likesCount: 73,
        commentsCount: 18
      },
      {
        id: '6',
        imageUrl: '/images/social/post6.jpg',
        text: 'Visit our website or download the app for the latest Summer Classes & Events📆 Stay connected with everything happening at 360 Gym.',
        link: 'https://www.instagram.com/p/DIwgNeHJnTQ/',
        isCarousel: false,
        isVideo: false,
        timestamp: new Date('2024-01-03'),
        likesCount: 41,
        commentsCount: 7
      },
      {
        id: '7',
        imageUrl: '/images/social/post7.jpg',
        text: 'Balancing life this week like…⚖️ Sometimes gymnastics skills come in handy in everyday life!',
        link: 'https://www.instagram.com/reel/DH9TesfyP8t/',
        isCarousel: false,
        isVideo: true,
        timestamp: new Date('2024-01-01'),
        likesCount: 134,
        commentsCount: 24
      },
      {
        id: '8',
        imageUrl: '/images/social/post8.jpg',
        text: '🎉 Enrollment is OPEN for Summer Camps at 360 Gymnastics! 🎉 Secure your spot today for an unforgettable summer experience.',
        link: 'https://www.instagram.com/p/DHlUQ5fR13X/',
        isCarousel: true,
        isVideo: false,
        timestamp: new Date('2023-12-28'),
        likesCount: 95,
        commentsCount: 21
      },
      {
        id: '9',
        imageUrl: '/images/social/post9.jpg',
        text: 'A few reminders ✏️ Don\'t forget about our upcoming events and schedule changes.',
        link: 'https://www.instagram.com/p/DHGqHAgxcFm/',
        isCarousel: false,
        isVideo: false,
        timestamp: new Date('2023-12-25'),
        likesCount: 38,
        commentsCount: 6
      },
      {
        id: '10',
        imageUrl: '/images/social/post10.jpg',
        text: '✨ A glimpse into our meet weekend ✨ Amazing performances from all our athletes!',
        link: 'https://www.instagram.com/p/DG9UvKUpzJG/',
        isCarousel: false,
        isVideo: false,
        timestamp: new Date('2023-12-22'),
        likesCount: 156,
        commentsCount: 32
      },
      {
        id: '11',
        imageUrl: '/images/social/post11.jpg',
        text: '💕It\'s that time of year again! We are looking to grow our girls team! Join our competitive gymnastics family.',
        link: 'https://www.instagram.com/p/DGyKkYaJV7i/',
        isCarousel: false,
        isVideo: false,
        timestamp: new Date('2023-12-20'),
        likesCount: 78,
        commentsCount: 14
      },
      {
        id: '12',
        imageUrl: '/images/social/post12.jpg',
        text: 'NEW ADDITIONAL TIME! 📢 First 20 to sign up with code 360DEMO are FREE 🆓 Don\'t miss this amazing opportunity!',
        link: 'https://www.instagram.com/p/DGecrP3JGfK/',
        isCarousel: false,
        isVideo: false,
        timestamp: new Date('2023-12-18'),
        likesCount: 112,
        commentsCount: 28
      }
    ]
  };

  private postsSubject = new BehaviorSubject<ProcessedInstagramPost[]>([]);
  public posts$ = this.postsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPosts();
  }

  /**
   * Load Instagram posts - tries API first, falls back to static data
   */
  loadPosts(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // For now, we'll use the fallback posts
    // Try to load from Instagram API first, fall back to placeholder data
    const accessToken = environment.instagram.accessToken;
    
    if (accessToken && accessToken !== 'YOUR_ACCESS_TOKEN_HERE') {
      this.getInstagramPosts(accessToken).subscribe({
        next: (posts) => {
          this.postsSubject.next(posts);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadFallbackPosts();
        }
      });
    } else {
      this.loadFallbackPosts();
    }
  }

  /**
   * Get Instagram posts using Basic Display API
   * Note: This requires proper app setup and access tokens
   */
  getInstagramPosts(accessToken: string, limit: number = 12): Observable<ProcessedInstagramPost[]> {
    if (!accessToken) {
      return this.getFallbackPosts();
    }

    const params = new HttpParams()
      .set('fields', 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp')
      .set('limit', limit.toString())
      .set('access_token', accessToken);

    return this.http.get<InstagramMediaData>(`${this.INSTAGRAM_BASIC_URL}/me/media`, { params })
      .pipe(
        map(response => 
          {
            console.log('Instagram API response:', response);
            return this.processInstagramPosts(response.data)
          }),
        catchError(error => {
          console.warn('Instagram API failed, using fallback data:', error);
          this.errorSubject.next('Unable to load live Instagram posts. Showing recent posts.');
          return this.getFallbackPosts();
        })
      );
  }

  /**
   * Get posts using Instagram Graph API (for business accounts)
   * Note: Requires app review and business verification
   */
  getInstagramGraphPosts(accessToken: string, userId: string, limit: number = 12): Observable<ProcessedInstagramPost[]> {
    if (!accessToken || !userId) {
      return this.getFallbackPosts();
    }

    const params = new HttpParams()
      .set('fields', 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count')
      .set('limit', limit.toString())
      .set('access_token', accessToken);

    return this.http.get<InstagramMediaData>(`${this.INSTAGRAM_BASE_URL}/${userId}/media`, { params })
      .pipe(
        map(response => this.processInstagramPosts(response.data)),
        catchError(error => {
          console.warn('Instagram Graph API failed, using fallback data:', error);
          this.errorSubject.next('Unable to load live Instagram posts. Showing recent posts.');
          return this.getFallbackPosts();
        })
      );
  }

  /**
   * Alternative method using Instagram embed API (no authentication required)
   * This method scrapes public Instagram data
   */
  getPublicInstagramPosts(username: string = 'kc360gym', _limit: number = 12): Observable<ProcessedInstagramPost[]> {
    // Note: This would require a backend service to avoid CORS issues
    // For now, return fallback posts
    console.log(`Loading public posts for @${username}`);
    return this.getFallbackPosts();
  }

  /**
   * Get fallback posts when API is not available
   */
  getFallbackPosts(): Observable<ProcessedInstagramPost[]> {
    return of(this.config.fallbackPosts || []);
  }

  /**
   * Load fallback posts and update subjects
   */
  private loadFallbackPosts(): void {
    setTimeout(() => {
      const posts = this.config.fallbackPosts || [];
      this.postsSubject.next(posts);
      this.loadingSubject.next(false);
    }, 1000); // Simulate loading time
  }

  /**
   * Process raw Instagram API response into our standardized format
   */
  private processInstagramPosts(posts: any[]): ProcessedInstagramPost[] {
    return posts.map(post => ({
      id: post.id,
      imageUrl: post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url,
      text: this.cleanCaption(post.caption || ''),
      link: post.permalink,
      isCarousel: post.media_type === 'CAROUSEL_ALBUM',
      isVideo: post.media_type === 'VIDEO',
      timestamp: new Date(post.timestamp),
      likesCount: post.like_count,
      commentsCount: post.comments_count
    }));
  }

  /**
   * Clean Instagram caption text
   */
  private cleanCaption(caption: string): string {
    // Remove excessive hashtags and clean up text
    return caption
      .replace(/#\w+/g, '') // Remove hashtags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 150) + (caption.length > 150 ? '...' : '');
  }

  /**
   * Refresh Instagram access token
   */
  refreshAccessToken(refreshToken: string): Observable<any> {
    const params = new HttpParams()
      .set('grant_type', 'ig_refresh_token')
      .set('access_token', refreshToken);

    return this.http.get(`${this.INSTAGRAM_BASE_URL}/refresh_access_token`, { params })
      .pipe(
        catchError(error => {
          console.error('Failed to refresh Instagram access token:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Configure Instagram settings
   */
  setConfig(config: Partial<InstagramConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): InstagramConfig {
    return { ...this.config };
  }

  /**
   * Get account URL
   */
  getAccountUrl(): string {
    return `https://www.instagram.com/${this.config.accountUsername}/`;
  }

  /**
   * Check if posts should be refreshed
   */
  shouldRefresh(): boolean {
    // Refresh every 30 minutes
    const lastRefresh = localStorage.getItem('instagram_last_refresh');
    if (!lastRefresh) return true;
    
    const lastRefreshTime = new Date(lastRefresh);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastRefreshTime.getTime()) / (1000 * 60);
    
    return diffMinutes > 30;
  }

  /**
   * Update last refresh timestamp
   */
  private updateLastRefresh(): void {
    localStorage.setItem('instagram_last_refresh', new Date().toISOString());
  }

  /**
   * Retry loading posts
   */
  retryLoadPosts(): void {
    this.loadPosts();
  }
}