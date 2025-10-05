import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ApiResponse,
  PaginatedResponse,
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementFilters,
  AnnouncementStats,
  Staff,
  HomepageStaff,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffFilters,
  StaffStats,
  PhotoUploadResponse,
  PhotoInfo,
  GymHours,
  UpdateGymHoursRequest,
  BulkUpdateHoursRequest,
  GymStatus,
  HoursCheckRequest,
  GymClosure,
  CreateClosureRequest,
  EmergencyClosureRequest,
  ClosureFilters,
  ClosureStats,
  DashboardStats,
  ClassScheduleItem,
  ClassScheduleResponse,
  ApiEndpoints
} from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_BASE = this.getApiBase();

  constructor(private http: HttpClient) {}

  // ========== ANNOUNCEMENT METHODS ==========

  /**
   * Get all announcements with optional filters
   */
  getAnnouncements(filters?: AnnouncementFilters): Observable<PaginatedResponse<Announcement>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Announcement>>>(
      `${this.API_BASE}${ApiEndpoints.ANNOUNCEMENTS}`,
      { params }
    ).pipe(
      map(response => this.handlePaginatedResponse<Announcement>(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get active announcements (public endpoint)
   */
  getActiveAnnouncements(limit?: number): Observable<Announcement[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<ApiResponse<Announcement[]>>(
      `${this.API_BASE}${ApiEndpoints.ANNOUNCEMENTS_ACTIVE}`,
      { params }
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get announcement by ID
   */
  getAnnouncement(id: number): Observable<Announcement> {
    return this.http.get<ApiResponse<Announcement>>(
      `${this.API_BASE}${ApiEndpoints.ANNOUNCEMENTS}/${id}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Create new announcement
   */
  createAnnouncement(announcement: CreateAnnouncementRequest): Observable<Announcement> {
    return this.http.post<ApiResponse<Announcement>>(
      `${this.API_BASE}${ApiEndpoints.ANNOUNCEMENTS}`,
      announcement
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Update announcement
   */
  updateAnnouncement(id: number, announcement: UpdateAnnouncementRequest): Observable<Announcement> {
    return this.http.put<ApiResponse<Announcement>>(
      `${this.API_BASE}${ApiEndpoints.ANNOUNCEMENTS}/${id}`,
      announcement
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Delete announcement
   */
  deleteAnnouncement(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.API_BASE}${ApiEndpoints.ANNOUNCEMENTS}/${id}`
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  /**
   * Get announcement statistics
   */
  getAnnouncementStats(): Observable<AnnouncementStats> {
    return this.http.get<ApiResponse<AnnouncementStats>>(
      `${this.API_BASE}${ApiEndpoints.ANNOUNCEMENTS_STATS}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  // ========== STAFF METHODS ==========

  /**
   * Get all staff with optional filters
   */
  getStaff(filters?: StaffFilters): Observable<PaginatedResponse<Staff>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Staff>>>(
      `${this.API_BASE}${ApiEndpoints.STAFF}`,
      { params }
    ).pipe(
      map(response => this.handlePaginatedResponse<Staff>(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get staff member by ID
   */
  getStaffMember(id: number): Observable<Staff> {
    return this.http.get<ApiResponse<Staff>>(
      `${this.API_BASE}${ApiEndpoints.STAFF}/${id}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Create new staff member
   */
  createStaff(staff: CreateStaffRequest): Observable<Staff> {
    return this.http.post<ApiResponse<Staff>>(
      `${this.API_BASE}${ApiEndpoints.STAFF}`,
      staff
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Update staff member
   */
  updateStaff(id: number, staff: UpdateStaffRequest): Observable<Staff> {
    return this.http.put<ApiResponse<Staff>>(
      `${this.API_BASE}${ApiEndpoints.STAFF}/${id}`,
      staff
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Delete staff member (deactivate)
   */
  deleteStaff(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.API_BASE}${ApiEndpoints.STAFF}/${id}`
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  /**
   * Get staff for homepage display (public endpoint)
   */
  getHomepageStaff(): Observable<HomepageStaff[]> {
    return this.http.get<ApiResponse<{ staff: HomepageStaff[]; total: number }>>(
      `${this.API_BASE}${ApiEndpoints.STAFF_HOMEPAGE}`
    ).pipe(
      map(response => this.handleResponse(response).staff),
      catchError(this.handleError)
    );
  }

  /**
   * Get staff statistics
   */
  getStaffStats(): Observable<StaffStats> {
    return this.http.get<ApiResponse<StaffStats>>(
      `${this.API_BASE}${ApiEndpoints.STAFF_STATS}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Upload staff photo
   */
  uploadStaffPhoto(userId: number, file: File): Observable<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('user_id', userId.toString());

    return this.http.post<ApiResponse<PhotoUploadResponse>>(
      `${this.API_BASE}${ApiEndpoints.STAFF_UPLOAD_PHOTO}`,
      formData
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Delete staff photo
   */
  deleteStaffPhoto(userId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.API_BASE}${ApiEndpoints.STAFF}/${userId}/photo`
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  /**
   * Get staff photo info
   */
  getStaffPhoto(userId: number): Observable<PhotoInfo> {
    return this.http.get<ApiResponse<PhotoInfo>>(
      `${this.API_BASE}${ApiEndpoints.STAFF}/${userId}/photo`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  // ========== GYM HOURS METHODS ==========

  /**
   * Get all gym hours
   */
  getGymHours(): Observable<GymHours[]> {
    return this.http.get<ApiResponse<GymHours[]>>(
      `${this.API_BASE}${ApiEndpoints.GYM_HOURS}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get current week hours
   */
  getWeekHours(): Observable<GymHours[]> {
    return this.http.get<ApiResponse<GymHours[]>>(
      `${this.API_BASE}${ApiEndpoints.GYM_HOURS_WEEK}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get current gym status
   */
  getGymStatus(): Observable<GymStatus> {
    return this.http.get<ApiResponse<{ current_status: GymStatus }>>(
      `${this.API_BASE}${ApiEndpoints.GYM_HOURS_STATUS}`
    ).pipe(
      map(response => this.handleResponse(response).current_status),
      catchError(this.handleError)
    );
  }

  /**
   * Update hours for specific day
   */
  updateDayHours(day: string, hours: UpdateGymHoursRequest): Observable<GymHours> {
    return this.http.put<ApiResponse<GymHours>>(
      `${this.API_BASE}${ApiEndpoints.GYM_HOURS}/${day}`,
      hours
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Bulk update all hours
   */
  bulkUpdateHours(request: BulkUpdateHoursRequest): Observable<GymHours[]> {
    return this.http.put<ApiResponse<GymHours[]>>(
      `${this.API_BASE}${ApiEndpoints.GYM_HOURS_BULK}`,
      request
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Check if gym is open at specific day/time
   */
  checkGymHours(request: HoursCheckRequest): Observable<{ is_open: boolean; message: string }> {
    let params = new HttpParams()
      .set('day', request.day)
      .set('time', request.time);

    return this.http.get<ApiResponse<{ is_open: boolean; message: string }>>(
      `${this.API_BASE}${ApiEndpoints.GYM_HOURS_CHECK}`,
      { params }
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  // ========== GYM CLOSURE METHODS ==========

  /**
   * Get all closures with optional filters
   */
  getClosures(filters?: ClosureFilters): Observable<PaginatedResponse<GymClosure>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<GymClosure>>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES}`,
      { params }
    ).pipe(
      map(response => this.handlePaginatedResponse<GymClosure>(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get upcoming closures
   */
  getUpcomingClosures(limit?: number): Observable<GymClosure[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<ApiResponse<GymClosure[]>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES_UPCOMING}`,
      { params }
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get current month closures
   */
  getCurrentMonthClosures(): Observable<GymClosure[]> {
    return this.http.get<ApiResponse<GymClosure[]>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES_CURRENT_MONTH}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get closure by ID
   */
  getClosure(id: number): Observable<GymClosure> {
    return this.http.get<ApiResponse<GymClosure>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES}/${id}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Create new closure
   */
  createClosure(closure: CreateClosureRequest): Observable<GymClosure> {
    return this.http.post<ApiResponse<GymClosure>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES}`,
      closure
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Update closure
   */
  updateClosure(id: number, closure: Partial<CreateClosureRequest>): Observable<GymClosure> {
    return this.http.put<ApiResponse<GymClosure>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES}/${id}`,
      closure
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Delete closure
   */
  deleteClosure(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES}/${id}`
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  /**
   * Close gym for today (emergency)
   */
  closeToday(reason: string, description: string): Observable<GymClosure> {
    return this.http.post<ApiResponse<GymClosure>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES_CLOSE_TODAY}`,
      { reason, description }
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Create emergency closure
   */
  createEmergencyClosure(request: EmergencyClosureRequest): Observable<GymClosure> {
    return this.http.post<ApiResponse<GymClosure>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES_EMERGENCY}`,
      request
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Check if gym is closed on specific date
   */
  checkClosure(date: string): Observable<{ is_closed: boolean; closure?: GymClosure }> {
    const params = new HttpParams().set('date', date);

    return this.http.get<ApiResponse<{ is_closed: boolean; closure?: GymClosure }>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES_CHECK}`,
      { params }
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get closure statistics
   */
  getClosureStats(): Observable<ClosureStats> {
    return this.http.get<ApiResponse<ClosureStats>>(
      `${this.API_BASE}${ApiEndpoints.GYM_CLOSURES_STATS}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  // ========== DASHBOARD METHODS ==========

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    // This combines multiple API calls to get comprehensive dashboard data
    return this.http.get<ApiResponse<DashboardStats>>(
      `${this.API_BASE}/dashboard/stats`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  // ========== CLASS SCHEDULE METHODS ==========

  /**
   * Get class schedule for a specific category
   */
  getClassSchedule(category: string): Observable<ClassScheduleItem[]> {
    const params = new HttpParams().set('cat1', category);

    return this.http.get<ApiResponse<ClassScheduleItem[]>>(
      `${this.API_BASE}${ApiEndpoints.CLASSES_SCHEDULE}`,
      { params }
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
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
    
    // Restructure the API response to match our PaginatedResponse interface
    // API returns: { data: T[], pagination: {...} }
    // We need: { data: T[], pagination: {...} }
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
   * Handle API errors
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      // Handle validation errors
      const errors = Object.values(error.error.errors).flat();
      errorMessage = (errors as string[]).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  };
}