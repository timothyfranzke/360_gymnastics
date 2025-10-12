import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/api';

interface NavigationItem {
  name: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
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
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Check for mobile view
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
}