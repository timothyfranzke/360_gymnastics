import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

interface NavigationItem {
  name: string;
  href: string;
  isExternal?: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  imports: [CommonModule, RouterLink, RouterLinkActive],
  animations: [
    trigger('slideInFromRight', [
      state('closed', style({ transform: 'translateX(100%)' })),
      state('open', style({ transform: 'translateX(0)' })),
      transition('closed => open', [
        animate('300ms ease-in-out')
      ]),
      transition('open => closed', [
        animate('300ms ease-in-out')
      ])
    ]),
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      state('out', style({ opacity: 0 })),
      transition('in => out', [
        animate('200ms ease-out')
      ]),
      transition('out => in', [
        animate('200ms ease-in')
      ])
    ]),
    trigger('rotateIcon', [
      state('closed', style({ transform: 'rotate(0deg)' })),
      state('open', style({ transform: 'rotate(180deg)' })),
      transition('closed => open', [
        animate('300ms ease-in-out')
      ]),
      transition('open => closed', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class Header implements OnInit, OnDestroy {
  isScrolled = false;
  isMobileMenuOpen = false;
  
  private destroy$ = new Subject<void>();

  desktopNavItems: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Classes', href: '/classes' },
    { name: 'Camps/Events', href: '/camps-events' },
    { name: 'Open Gym', href: '/open-gym' },
    { name: 'Parties', href: '/parties' },
    { name: 'Contact', href: '/contact' }
  ];

  mobileNavItems: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Classes', href: '/classes' },
    { name: 'Camps/Events', href: '/camps-events' },
    { name: 'Open Gym', href: '/open-gym' },
    { name: 'Parties', href: '/parties' },
    { name: 'Team', href: '/team' },
    { name: 'Schedule & Tuition', href: '/schedule-tuition' },
    { name: 'Contact', href: '/contact' }
  ];

  ngOnInit(): void {
    // Initial scroll check
    this.checkScrollPosition();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScrollPosition();
  }

  @HostListener('window:resize', [])
  onWindowResize(): void {
    // Close mobile menu on resize to desktop
    if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const header = document.querySelector('header');
    
    // Close mobile menu if clicking outside
    if (this.isMobileMenuOpen && header && !header.contains(target)) {
      this.closeMobileMenu();
    }
  }

  private checkScrollPosition(): void {
    this.isScrolled = window.scrollY > 10;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Prevent body scroll when menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  onMobileNavClick(): void {
    this.closeMobileMenu();
  }

  getHeaderClasses(): string {
    const baseClasses = 'fixed top-0 left-0 w-full z-50 transition-all duration-300';
    const scrollClasses = this.isScrolled 
      ? 'bg-white shadow-lg text-gray-800' 
      : 'bg-white text-gray-800';
    
    return `${baseClasses} ${scrollClasses}`;
  }

  getMobileMenuClasses(): string {
    const baseClasses = 'fixed inset-0 bg-white/95 z-40 transform transition-transform duration-300 ease-in-out md:hidden';
    const positionClasses = this.isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full';
    
    return `${baseClasses} ${positionClasses}`;
  }

  getHamburgerIconPath(): string {
    return this.isMobileMenuOpen 
      ? 'M6 18L18 6M6 6l12 12'  // X icon
      : 'M4 6h16M4 12h16M4 18h16'; // Hamburger icon
  }
}