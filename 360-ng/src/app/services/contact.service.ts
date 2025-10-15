import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  ContactFormRequest, 
  ContactFormResponse, 
  ApiResponse, 
  ApiEndpoints 
} from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly API_BASE = this.getApiBase();

  constructor(private http: HttpClient) {}

  /**
   * Submit contact form
   */
  submitContactForm(contactData: ContactFormRequest): Observable<ContactFormResponse> {
    return this.http.post<ApiResponse<ContactFormResponse>>(
      `${this.API_BASE}${ApiEndpoints.CONTACT}`,
      contactData
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
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
   * Handle API errors
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An unexpected error occurred while sending your message. Please try again.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      // Handle validation errors
      const errors = Object.values(error.error.errors).flat();
      errorMessage = (errors as string[]).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  };
}