import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ContactSubmission, ContactFilters, PaginatedContactResponse } from '../views/admin/contacts/list/list';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private apiUrl = `${environment.api.baseUrl}/contacts`;

  constructor(private http: HttpClient) {}

  getContacts(filters: ContactFilters = {}): Observable<PaginatedContactResponse> {
    let params = new HttpParams();
    
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }
    
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => ({
        data: response.data,
        pagination: {
          current_page: response.pagination.current_page,
          total_pages: response.pagination.total_pages,
          total_items: response.pagination.total_items,
          items_per_page: response.pagination.per_page
        }
      }))
    );
  }

  getContact(id: number): Observable<ContactSubmission> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateContact(id: number, data: { status: 'new' | 'read' | 'responded' }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}