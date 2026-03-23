import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface OpenGymConfig {
  id?: number;
  type: 'main' | 'structured';
  title?: string;
  subtitle?: string;
  description?: string;
  schedule?: ScheduleItem[];
  features?: string[];
  importantInfo?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AgeGroup {
  id?: number;
  title: string;
  subtitle?: string;
  days?: string;
  time?: string;
  price?: number;
  priceUnit?: string;
  notes?: string;
  sortOrder?: number;
  colorTheme?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleItem {
  day: string;
  time: string;
}

export interface OpenGymData {
  mainConfig?: OpenGymConfig | null;
  structuredConfig?: OpenGymConfig | null;
  ageGroups: AgeGroup[];
}

@Injectable({
  providedIn: 'root'
})
export class OpenGymService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}/open-gym`;

  private dataSubject = new BehaviorSubject<OpenGymData>({
    mainConfig: null,
    structuredConfig: null,
    ageGroups: []
  });

  public data$ = this.dataSubject.asObservable();

  getAllData(): Observable<OpenGymData> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  getMainConfig(): Observable<OpenGymConfig> {
    return this.http.get<any>(`${this.baseUrl}/main`).pipe(
      map(response => response.data)
    );
  }

  getStructuredConfig(): Observable<OpenGymConfig> {
    return this.http.get<any>(`${this.baseUrl}/structured`).pipe(
      map(response => response.data)
    );
  }

  getAgeGroups(): Observable<AgeGroup[]> {
    return this.http.get<any>(`${this.baseUrl}/age-groups`).pipe(
      map(response => response.data)
    );
  }

  getAgeGroup(id: number): Observable<AgeGroup> {
    return this.http.get<any>(`${this.baseUrl}/age-groups/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateMainConfig(data: Partial<OpenGymConfig>): Observable<any> {
    return this.http.put(`${this.baseUrl}/main`, data);
  }

  updateStructuredConfig(data: Partial<OpenGymConfig>): Observable<any> {
    return this.http.put(`${this.baseUrl}/structured`, data);
  }

  createAgeGroup(data: Omit<AgeGroup, 'id' | 'created_at' | 'updated_at'>): Observable<{id: number; message: string}> {
    return this.http.post<{id: number; message: string}>(`${this.baseUrl}/age-groups`, data);
  }

  updateAgeGroup(id: number, data: Partial<AgeGroup>): Observable<{message: string}> {
    return this.http.put<{message: string}>(`${this.baseUrl}/age-groups/${id}`, data);
  }

  deleteAgeGroup(id: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.baseUrl}/age-groups/${id}`);
  }

  loadData(): void {
    this.getAllData().subscribe({
      next: (data) => {
        this.dataSubject.next(data);
      },
      error: (error) => {
        console.error('Error loading open gym data:', error);
      }
    });
  }

  refreshData(): void {
    this.loadData();
  }

  getCurrentData(): OpenGymData {
    return this.dataSubject.value;
  }
}