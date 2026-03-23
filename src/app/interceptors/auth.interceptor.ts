import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor for handling authentication tokens and errors
 * Automatically adds JWT token to requests and handles auth errors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Get the auth token
  const token = authService.getToken();
  
  // Clone the request and add the authorization header if token exists
  let authReq = req;
  if (token && req.url.includes('/api/')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle authentication errors
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
        // Try to refresh token first (only if we have a token and aren't already trying to refresh)
        if (authService.getToken()) {
          return authService.refreshAuthToken().pipe(
            switchMap(() => {
              // Retry the original request with new token
              const newToken = authService.getToken();
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(retryReq);
            }),
            catchError(() => {
              // If refresh fails, logout
              authService.forceLogout('Session expired. Please login again.');
              return throwError(() => new Error('Authentication failed'));
            })
          );
        } else {
          // No token, just logout
          authService.forceLogout('Session expired. Please login again.');
          return throwError(() => new Error('Authentication failed'));
        }
      }
      
      // Handle forbidden errors
      if (error.status === 403) {
        return throwError(() => new Error('Access denied. Insufficient permissions.'));
      }
      
      // Handle server errors
      if (error.status >= 500) {
        return throwError(() => new Error('Server error. Please try again later.'));
      }
      
      // Handle network errors
      if (error.status === 0) {
        return throwError(() => new Error('Network error. Please check your connection.'));
      }
      
      // For other errors, pass them through
      return throwError(() => error);
    })
  );
};