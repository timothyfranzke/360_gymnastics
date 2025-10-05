import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Auth guard to protect admin routes
 * Redirects unauthenticated users to login page
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        // Store the attempted URL for redirect after login
        router.navigate(['/admin/login'], { 
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    })
  );
};

/**
 * Admin guard to ensure only admin users can access certain routes
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && user.role === 'admin') {
        return true;
      } else {
        router.navigate(['/admin/dashboard']);
        return false;
      }
    })
  );
};

/**
 * Staff guard to ensure only staff and admin users can access routes
 */
export const staffGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && (user.role === 'admin' || user.role === 'staff')) {
        return true;
      } else {
        router.navigate(['/admin/login']);
        return false;
      }
    })
  );
};