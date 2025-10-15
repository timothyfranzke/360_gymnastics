import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  Camp, 
  CreateCampRequest, 
  UpdateCampRequest, 
  CampFilters, 
  CampStats 
} from '../interfaces/camp';
import { ApiResponse, PaginatedResponse } from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class CampsService {
  private readonly API_BASE = this.getApiBase();

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  /**
   * Get all camps with optional filters
   */
  getCamps(filters?: CampFilters): Observable<PaginatedResponse<Camp>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Camp>>>(
      `${this.API_BASE}/camps`,
      { params }
    ).pipe(
      map(response => this.handlePaginatedResponse<Camp>(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get active camps (public endpoint)
   */
  getActiveCamps(limit?: number): Observable<Camp[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<ApiResponse<Camp[]>>(
      `${this.API_BASE}/camps/active`,
      { params }
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get upcoming camps (public endpoint)
   */
  getUpcomingCamps(limit?: number): Observable<Camp[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<ApiResponse<Camp[]>>(
      `${this.API_BASE}/camps/upcoming`,
      { params }
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get camp by ID
   */
  getCamp(id: number): Observable<Camp> {
    return this.http.get<ApiResponse<Camp>>(
      `${this.API_BASE}/camps/${id}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Create new camp
   */
  createCamp(camp: CreateCampRequest): Observable<Camp> {
    return this.http.post<ApiResponse<Camp>>(
      `${this.API_BASE}/camps`,
      camp
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Update camp
   */
  updateCamp(id: number, camp: UpdateCampRequest): Observable<Camp> {
    return this.http.put<ApiResponse<Camp>>(
      `${this.API_BASE}/camps/${id}`,
      camp
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Delete camp
   */
  deleteCamp(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.API_BASE}/camps/${id}`
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  /**
   * Get camp statistics
   */
  getCampStats(): Observable<CampStats> {
    return this.http.get<ApiResponse<CampStats>>(
      `${this.API_BASE}/camps/stats`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get mock camps data for development/fallback
   */
  getMockCamps(): Observable<Camp[]> {
    const mockCamps: Camp[] = [
      {
        id: 1,
        title: "Spring Break Gymnastics Camp",
        date: "2024-03-25",
        cost: 125,
        description: "A fun-filled week of gymnastics training during spring break. Perfect for beginners and intermediate gymnasts aged 6-12.",
        time: "9:00 AM - 3:00 PM",
        registration_link: "https://360gymnastics.com/register/spring-camp",
        is_active: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        title: "Summer Intensive Training Camp",
        date: "2024-07-15",
        cost: 200,
        description: "Intensive training camp for competitive gymnasts. Focus on skill development, conditioning, and routine preparation.",
        time: "8:00 AM - 4:00 PM",
        registration_link: "https://360gymnastics.com/register/summer-intensive",
        is_active: true,
        created_at: "2024-02-01T10:00:00Z",
        updated_at: "2024-02-01T10:00:00Z"
      },
      {
        id: 3,
        title: "Holiday Fun Camp",
        date: "2024-12-20",
        cost: 100,
        description: "Holiday-themed gymnastics camp with games, crafts, and gymnastics activities. Great for kids aged 4-10.",
        time: "10:00 AM - 2:00 PM",
        registration_link: "https://360gymnastics.com/register/holiday-camp",
        is_active: true,
        created_at: "2024-10-01T10:00:00Z",
        updated_at: "2024-10-01T10:00:00Z"
      },
      {
        id: 4,
        title: "Advanced Skills Workshop",
        date: "2024-11-10",
        cost: 150,
        description: "Advanced skills workshop for level 4+ gymnasts. Focus on back handsprings, back tucks, and advanced bar skills.",
        time: "1:00 PM - 5:00 PM",
        registration_link: "https://360gymnastics.com/register/advanced-workshop",
        is_active: true,
        created_at: "2024-09-15T10:00:00Z",
        updated_at: "2024-09-15T10:00:00Z"
      }
    ];

    return of(mockCamps);
  }

  // ========== UTILITY METHODS ==========

  /**
   * Get API base URL based on environment
   */
  private getApiBase(): string {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      return 'http://localhost:8080/api/v1';
    }
    
    return '/api/v1';
  }

  /**
   * Handle successful API responses
   */
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    return response.data!;
  }

  /**
   * Handle successful paginated API responses
   */
  private handlePaginatedResponse<T>(response: any): PaginatedResponse<T> {
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    
    return {
      data: response.data || [],
      pagination: {
        current_page: response.pagination?.current_page || 1,
        total_pages: response.pagination?.total_pages || 1,
        total_items: response.pagination?.total_items || 0,
        items_per_page: response.pagination?.per_page || response.pagination?.items_per_page || 10,
        has_next_page: response.pagination?.has_next_page || false,
        has_previous_page: response.pagination?.has_prev_page || response.pagination?.has_previous_page || false
      }
    };
  }

  /**
   * Handle API errors and fallback to mock data
   */
  private handleError = (error: any): Observable<any> => {
    console.warn('API request failed, falling back to mock data:', error);
    
    // For development, return mock data when API fails
    return this.getMockCamps();
  };
}