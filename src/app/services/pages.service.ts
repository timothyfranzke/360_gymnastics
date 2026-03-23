import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Page,
  CreatePageRequest,
  UpdatePageRequest,
  PageFilters,
  PageStats
} from '../interfaces/page';
import { ApiResponse, PaginatedResponse } from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class PagesService {
  private readonly API_BASE = this.getApiBase();

  constructor(private http: HttpClient) {}

  getPages(filters?: PageFilters): Observable<PaginatedResponse<Page>> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Page>>>(
      `${this.API_BASE}/pages`,
      { params }
    ).pipe(
      map(response => this.handlePaginatedResponse<Page>(response)),
      catchError(this.handleError)
    );
  }

  getPublishedPages(): Observable<{ id: number; title: string; slug: string }[]> {
    return this.http.get<ApiResponse<{ id: number; title: string; slug: string }[]>>(
      `${this.API_BASE}/pages/published`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  getPage(id: number): Observable<Page> {
    return this.http.get<ApiResponse<Page>>(
      `${this.API_BASE}/pages/${id}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  getPageBySlug(slug: string): Observable<Page> {
    return this.http.get<ApiResponse<Page>>(
      `${this.API_BASE}/pages/slug/${slug}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  createPage(page: CreatePageRequest): Observable<Page> {
    return this.http.post<ApiResponse<Page>>(
      `${this.API_BASE}/pages`,
      page
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  updatePage(id: number, page: UpdatePageRequest): Observable<Page> {
    return this.http.put<ApiResponse<Page>>(
      `${this.API_BASE}/pages/${id}`,
      page
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  deletePage(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.API_BASE}/pages/${id}`
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  togglePublished(id: number): Observable<Page> {
    return this.http.patch<ApiResponse<Page>>(
      `${this.API_BASE}/pages/${id}/toggle`,
      {}
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  uploadImage(file: File, pageId?: number): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    if (pageId) {
      formData.append('page_id', pageId.toString());
    }

    return this.http.post<ApiResponse<any>>(
      `${this.API_BASE}/pages/upload-image`,
      formData
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  getPageStats(): Observable<PageStats> {
    return this.http.get<ApiResponse<PageStats>>(
      `${this.API_BASE}/pages/stats`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  // ========== UTILITY METHODS ==========

  private getApiBase(): string {
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
      return 'http://localhost:8080/api/v1';
    }

    return '/api/v1';
  }

  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    return response.data!;
  }

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

  private handleError = (error: any): Observable<never> => {
    console.error('Pages API error:', error);
    return throwError(() => error);
  };
}
