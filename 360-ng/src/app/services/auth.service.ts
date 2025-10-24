import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  ApiResponse,
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest
} from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE = this.getApiBase();
  private readonly TOKEN_KEY = 'gym_auth_token';
  private readonly USER_KEY = 'gym_auth_user';
  private readonly TOKEN_EXPIRY_KEY = 'gym_auth_expiry';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private tokenRefreshTimer: any;

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeTokenRefresh();
  }

  /**
   * Login with credentials
   */
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_BASE}/auth/login`, credentials)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Login failed');
          }
          return response.data;
        }),
        tap(loginData => {
          this.setSession(loginData);
        }),
        map(loginData => loginData.user),
        catchError(this.handleError)
      );
  }

  /**
   * Register new user (admin only)
   */
  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<ApiResponse<{ user: User }>>(`${this.API_BASE}/auth/register`, userData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Registration failed');
          }
          return response.data.user;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logout user
   */
  logout(): Observable<void> {
    return this.http.post<ApiResponse>(`${this.API_BASE}/auth/logout`, {})
      .pipe(
        tap(() => this.clearSession()),
        map(() => void 0),
        catchError(() => {
          // Even if logout fails on server, clear local session
          this.clearSession();
          return throwError(() => new Error('Logout failed'));
        })
      );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.API_BASE}/auth/profile`)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to get profile');
          }
          return response.data.user;
        }),
        tap(user => {
          this.currentUserSubject.next(user);
          this.storeUser(user);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Get current user value
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Check if user has staff role (includes admin)
   */
  isStaff(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'staff' || user?.role === 'admin';
  }

  /**
   * Force logout (for token expiry or security reasons)
   */
  forceLogout(reason: string = 'Session expired'): void {
    this.clearSession();
    this.router.navigate(['/admin/login'], { 
      queryParams: { message: reason } 
    });
  }

  /**
   * Set authentication session
   */
  private setSession(authResult: LoginResponse): void {
    const expiresAt = new Date(authResult.expires_at).getTime();
    
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiresAt.toString());
    
    this.currentUserSubject.next(authResult.user);
    this.isAuthenticatedSubject.next(true);
    
    this.initializeTokenRefresh();
  }

  /**
   * Clear authentication session
   */
  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Store user in localStorage
   */
  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Check if current token is valid (not expired)
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (!token || !expiryTime) {
      return false;
    }
    
    const now = new Date().getTime();
    const expiry = parseInt(expiryTime, 10);
    
    return now < expiry;
  }

  /**
   * Initialize automatic token refresh
   */
  private initializeTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTime) return;

    const expiry = parseInt(expiryTime, 10);
    const now = new Date().getTime();
    const timeUntilExpiry = expiry - now;
    
    // Refresh token 5 minutes before expiry
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);
    
    if (refreshTime > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshToken().subscribe({
          error: () => this.forceLogout('Session expired')
        });
      }, refreshTime);
    } else {
      // Token is already expired or about to expire
      this.forceLogout('Session expired');
    }
  }

  /**
   * Refresh authentication token
   */
  private refreshToken(): Observable<void> {
    // Since the API doesn't have a refresh endpoint, we'll get the profile
    // which will validate the token and return fresh user data
    return this.getProfile().pipe(
      map(() => void 0),
      catchError(() => {
        this.forceLogout('Session expired');
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }

  /**
   * Get API base URL based on environment
   */
  private getApiBase(): string {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return 'http://localhost:8080/api/v1';
    }
    
    return '/360gym/api/v1';
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      // Handle validation errors
      const errors = Object.values(error.error.errors).flat();
      errorMessage = errors.join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle authentication errors
    if (error.status === 401) {
      this.forceLogout('Authentication failed');
    }
    
    return throwError(() => new Error(errorMessage));
  };
}