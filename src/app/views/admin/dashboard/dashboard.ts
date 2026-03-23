import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import {
  AnnouncementStats,
  StaffStats,
  ClosureStats,
  GymStatus,
  User,
  Announcement,
  GymClosure
} from '../../../interfaces/api';

interface DashboardCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  link?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [CommonModule, RouterLink]
})
export class AdminDashboard implements OnInit, OnDestroy {
  isLoading = true;
  error: string | null = null;
  currentUser: User | null = null;
  
  // Dashboard data
  announcementStats: AnnouncementStats | null = null;
  staffStats: StaffStats | null = null;
  closureStats: ClosureStats | null = null;
  gymStatus: GymStatus | null = null;
  recentAnnouncements: Announcement[] = [];
  upcomingClosures: GymClosure[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
    
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    const requests = {
      gymStatus: this.apiService.getGymStatus(),
      recentAnnouncements: this.apiService.getActiveAnnouncements(5),
      upcomingClosures: this.apiService.getUpcomingClosures(5)
    };

    // Add admin-only requests if user is admin
    if (this.currentUser?.role === 'admin') {
      Object.assign(requests, {
        announcementStats: this.apiService.getAnnouncementStats(),
        staffStats: this.apiService.getStaffStats(),
        closureStats: this.apiService.getClosureStats()
      });
    }

    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.gymStatus = data.gymStatus;
          this.recentAnnouncements = data.recentAnnouncements;
          this.upcomingClosures = data.upcomingClosures;
          
          if ('announcementStats' in data) {
            this.announcementStats = data.announcementStats as AnnouncementStats;
          }
          if ('staffStats' in data) {
            this.staffStats = data.staffStats as StaffStats;
          }
          if ('closureStats' in data) {
            this.closureStats = data.closureStats as ClosureStats;
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load dashboard data', error);
          this.error = error.message || 'Failed to load dashboard data';
          this.isLoading = false;
        }
      });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  // Helper methods for template
  getStatCards(): DashboardCard[] {
    const cards: DashboardCard[] = [];
    
    if (this.announcementStats) {
      cards.push({
        title: 'Active Announcements',
        value: this.announcementStats.active,
        icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        color: 'blue',
        link: '/admin/announcements'
      });
    }
    
    
    if (this.closureStats) {
      cards.push({
        title: 'Upcoming Closures',
        value: this.closureStats.upcoming,
        icon: 'M8 7V3a4 4 0 118 0v4m-4 6v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z',
        color: 'red',
        link: '/admin/closures'
      });
    }
    
    return cards;
  }

  getGymStatusColor(): string {
    if (!this.gymStatus) return 'gray';
    return this.gymStatus.is_open ? 'green' : 'red';
  }

  getGymStatusIcon(): string {
    if (!this.gymStatus) return '';
    return this.gymStatus.is_open 
      ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
  }

  getPriorityColor(priority: string): string {
    const colors = {
      low: 'gray',
      medium: 'yellow',
      high: 'orange',
      critical: 'red'
    };
    return colors[priority as keyof typeof colors] || 'gray';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
}