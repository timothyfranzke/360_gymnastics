import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DynamicStylesService {
  private loadedStyles = new Set<string>();

  /**
   * Dynamically loads additional styles when needed
   * This helps reduce the initial bundle size by loading non-critical styles on demand
   */
  async loadButtonStyles(): Promise<void> {
    if (this.loadedStyles.has('buttons')) {
      return;
    }

    try {
      // Create and inject additional button styles if needed
      // For now, mark as loaded since critical styles are already available
      this.loadedStyles.add('buttons');
      console.log('Button styles loaded (using critical styles)');
    } catch (error) {
      console.warn('Failed to load additional button styles:', error);
    }
  }

  /**
   * Loads styles for admin components
   */
  async loadAdminStyles(): Promise<void> {
    if (this.loadedStyles.has('admin')) {
      return;
    }

    try {
      // Can be extended to load admin-specific styles
      this.loadedStyles.add('admin');
    } catch (error) {
      console.warn('Failed to load admin styles:', error);
    }
  }

  /**
   * Preloads styles for better user experience
   * Call this after the initial page load to prepare for navigation
   */
  preloadStyles(): void {
    // Use requestIdleCallback if available for better performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadButtonStyles();
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        this.loadButtonStyles();
      }, 1000);
    }
  }
}