import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { BadgeNotificationsService, NotificationCounts } from '../../../services/badge-notifications';
import { User } from '../../../interfaces/api';

interface NavigationItem {
  name: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
  badgeCount?: number;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss'],
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive]
})
export class AdminLayout implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isSidebarOpen = false;
  isMobile = false;
  notificationCounts: NotificationCounts = { contacts: 0, parties: 0 };
  
  private destroy$ = new Subject<void>();

  navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
      route: '/admin/dashboard'
    },
    {
      name: 'Announcements',
      icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
      route: '/admin/announcements'
    },
    {
      name: 'Staff Management',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      route: '/admin/staff',
      adminOnly: true
    },
    {
      name: 'User Management',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      route: '/admin/users'
    },
    {
      name: 'Gym Hours',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      route: '/admin/hours'
    },
    {
      name: 'Closures',
      icon: 'M8 7V3a4 4 0 118 0v4m-4 6v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z',
      route: '/admin/closures'
    },
    {
      name: 'Banner Management',
      icon: 'M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v1a1 1 0 01-1 1h-1v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7H4a1 1 0 01-1-1V5a1 1 0 011-1h3zM9 3v1h6V3H9zm1 5v7h4V8h-4z',
      route: '/admin/banner',
      adminOnly: true
    },
    {
      name: 'Gallery Management',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      route: '/admin/gallery'
    },
    {
      name: 'Classes Management',
      icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
      route: '/admin/classes'
    },
    {
      name: 'Open Gym Management',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      route: '/admin/open-gym'
    },
    {
      name: 'Party Requests',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      route: '/admin/parties'
    },
    {
      name: 'Contact Submissions',
      icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      route: '/admin/contacts'
    },
    {
      name: 'FAQs',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      route: '/admin/faqs'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private badgeNotificationsService: BadgeNotificationsService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        // Start polling for notifications when user is authenticated
        if (user) {
          this.badgeNotificationsService.startPolling();
        }
      });

    // Subscribe to notification counts
    this.badgeNotificationsService.counts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(counts => {
        this.notificationCounts = counts;
      });

    // Check for mobile view
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.badgeNotificationsService.stopPolling();
    window.removeEventListener('resize', () => this.checkMobileView());
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/admin/login']);
      },
      error: () => {
        // Even if logout fails, redirect to login
        this.router.navigate(['/admin/login']);
      }
    });
  }

  private checkMobileView(): void {
    this.isMobile = window.innerWidth < 1024;
    if (!this.isMobile) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }

  // Helper methods for template
  getFilteredNavigation(): NavigationItem[] {
    return this.navigationItems.filter(item => {
      if (item.adminOnly) {
        return this.currentUser?.role === 'admin';
      }
      return true;
    });
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    const firstInitial = this.currentUser.first_name.charAt(0).toUpperCase();
    const lastInitial = this.currentUser.last_name.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    return this.currentUser.role === 'admin' ? 'Administrator' : 'Staff Member';
  }

  getBadgeCount(route: string): number {
    if (route === '/admin/contacts') {
      return this.notificationCounts.contacts;
    }
    if (route === '/admin/parties') {
      return this.notificationCounts.parties;
    }
    return 0;
  }

  onNavigationClick(route: string): void {
    // Mark items as viewed when user clicks on them
    if (route === '/admin/contacts') {
      this.badgeNotificationsService.markContactsAsViewed();
    } else if (route === '/admin/parties') {
      this.badgeNotificationsService.markPartiesAsViewed();
    }
  }
}