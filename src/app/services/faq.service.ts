import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Faq,
  FaqCategory,
  FaqGroupedByCategory,
  CreateFaqRequest,
  UpdateFaqRequest,
  CreateFaqCategoryRequest,
  UpdateFaqCategoryRequest,
  FaqFilters,
  FaqStats
} from '../interfaces/faq';
import { ApiResponse, PaginatedResponse } from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private readonly API_BASE = this.getApiBase();

  constructor(private http: HttpClient) {}

  // ========== PUBLIC METHODS ==========

  /**
   * Get all active FAQs grouped by category (public)
   */
  getFaqs(): Observable<FaqGroupedByCategory[]> {
    return this.http.get<ApiResponse<{ categories: FaqGroupedByCategory[] }>>(
      `${this.API_BASE}/faqs`
    ).pipe(
      map(response => this.handleResponse(response).categories),
      catchError(this.handleError)
    );
  }

  /**
   * Get FAQs by category slug (public)
   */
  getFaqsByCategory(slug: string): Observable<{ category: FaqCategory; faqs: Faq[] }> {
    return this.http.get<ApiResponse<{ category: FaqCategory; faqs: Faq[] }>>(
      `${this.API_BASE}/faqs/category/${slug}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Search FAQs (public)
   */
  searchFaqs(query: string, limit?: number): Observable<Faq[]> {
    let params = new HttpParams().set('q', query);
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<ApiResponse<{ faqs: Faq[] }>>(
      `${this.API_BASE}/faqs/search`,
      { params }
    ).pipe(
      map(response => this.handleResponse(response).faqs),
      catchError(this.handleError)
    );
  }

  /**
   * Get active categories with FAQ counts (public)
   */
  getCategories(): Observable<FaqCategory[]> {
    return this.http.get<ApiResponse<{ categories: FaqCategory[] }>>(
      `${this.API_BASE}/faq-categories`
    ).pipe(
      map(response => this.handleResponse(response).categories),
      catchError(this.handleError)
    );
  }

  // ========== ADMIN FAQ METHODS ==========

  /**
   * Get all FAQs with pagination (admin)
   */
  getAllFaqs(filters?: FaqFilters): Observable<PaginatedResponse<Faq>> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Faq>>>(
      `${this.API_BASE}/faqs/all`,
      { params }
    ).pipe(
      map(response => this.handlePaginatedResponse<Faq>(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get FAQ by ID
   */
  getFaq(id: number): Observable<Faq> {
    return this.http.get<ApiResponse<{ faq: Faq }>>(
      `${this.API_BASE}/faqs/${id}`
    ).pipe(
      map(response => this.handleResponse(response).faq),
      catchError(this.handleError)
    );
  }

  /**
   * Create FAQ
   */
  createFaq(faq: CreateFaqRequest): Observable<Faq> {
    return this.http.post<ApiResponse<{ faq: Faq }>>(
      `${this.API_BASE}/faqs`,
      faq
    ).pipe(
      map(response => this.handleResponse(response).faq),
      catchError(this.handleError)
    );
  }

  /**
   * Update FAQ
   */
  updateFaq(id: number, faq: UpdateFaqRequest): Observable<Faq> {
    return this.http.put<ApiResponse<{ faq: Faq }>>(
      `${this.API_BASE}/faqs/${id}`,
      faq
    ).pipe(
      map(response => this.handleResponse(response).faq),
      catchError(this.handleError)
    );
  }

  /**
   * Delete FAQ
   */
  deleteFaq(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.API_BASE}/faqs/${id}`
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  /**
   * Toggle FAQ active status
   */
  toggleFaq(id: number): Observable<Faq> {
    return this.http.patch<ApiResponse<{ faq: Faq }>>(
      `${this.API_BASE}/faqs/${id}/toggle`,
      {}
    ).pipe(
      map(response => this.handleResponse(response).faq),
      catchError(this.handleError)
    );
  }

  /**
   * Reorder FAQs
   */
  reorderFaqs(orders: { [id: number]: number }): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.API_BASE}/faqs/reorder`,
      { orders }
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  /**
   * Get FAQ statistics
   */
  getFaqStats(): Observable<FaqStats> {
    return this.http.get<ApiResponse<{ stats: FaqStats }>>(
      `${this.API_BASE}/faqs/stats`
    ).pipe(
      map(response => this.handleResponse(response).stats),
      catchError(this.handleError)
    );
  }

  // ========== CATEGORY ADMIN METHODS ==========

  /**
   * Get all categories (admin)
   */
  getAllCategories(): Observable<FaqCategory[]> {
    return this.http.get<ApiResponse<{ categories: FaqCategory[] }>>(
      `${this.API_BASE}/faq-categories/all`
    ).pipe(
      map(response => this.handleResponse(response).categories),
      catchError(this.handleError)
    );
  }

  /**
   * Get category by ID
   */
  getCategory(id: number): Observable<FaqCategory> {
    return this.http.get<ApiResponse<{ category: FaqCategory }>>(
      `${this.API_BASE}/faq-categories/${id}`
    ).pipe(
      map(response => this.handleResponse(response).category),
      catchError(this.handleError)
    );
  }

  /**
   * Create category
   */
  createCategory(category: CreateFaqCategoryRequest): Observable<FaqCategory> {
    return this.http.post<ApiResponse<{ category: FaqCategory }>>(
      `${this.API_BASE}/faq-categories`,
      category
    ).pipe(
      map(response => this.handleResponse(response).category),
      catchError(this.handleError)
    );
  }

  /**
   * Update category
   */
  updateCategory(id: number, category: UpdateFaqCategoryRequest): Observable<FaqCategory> {
    return this.http.put<ApiResponse<{ category: FaqCategory }>>(
      `${this.API_BASE}/faq-categories/${id}`,
      category
    ).pipe(
      map(response => this.handleResponse(response).category),
      catchError(this.handleError)
    );
  }

  /**
   * Delete category
   */
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.API_BASE}/faq-categories/${id}`
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  /**
   * Toggle category active status
   */
  toggleCategory(id: number): Observable<FaqCategory> {
    return this.http.patch<ApiResponse<{ category: FaqCategory }>>(
      `${this.API_BASE}/faq-categories/${id}/toggle`,
      {}
    ).pipe(
      map(response => this.handleResponse(response).category),
      catchError(this.handleError)
    );
  }

  /**
   * Reorder categories
   */
  reorderCategories(orders: { [id: number]: number }): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.API_BASE}/faq-categories/reorder`,
      { orders }
    ).pipe(
      map(() => void 0),
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
      const errors = Object.values(error.error.errors).flat();
      errorMessage = (errors as string[]).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  };
}
