import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { map, catchError, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface NotificationCounts {
  contacts: number;
  parties: number;
}

@Injectable({
  providedIn: 'root'
})
export class BadgeNotificationsService {
  private readonly API_BASE = environment.api.baseUrl;
  private countsSubject = new BehaviorSubject<NotificationCounts>({ contacts: 0, parties: 0 });
  public counts$ = this.countsSubject.asObservable();
  
  private refreshInterval = 30000; // 30 seconds
  private isPolling = false;

  constructor(private http: HttpClient) {}

  startPolling(): void {
    if (this.isPolling) return;
    
    this.isPolling = true;
    
    // Initial load
    this.refreshCounts().subscribe();
    
    // Poll every 30 seconds
    timer(this.refreshInterval, this.refreshInterval)
      .pipe(
        switchMap(() => this.refreshCounts()),
        catchError((error) => {
          console.error('Error polling notification counts:', error);
          return [];
        })
      )
      .subscribe();
  }

  stopPolling(): void {
    this.isPolling = false;
  }

  refreshCounts(): Observable<NotificationCounts> {
    const contactsCount$ = this.http.get<any>(`${this.API_BASE}/contacts/new-count`).pipe(
      map(response => response.data?.count || 0),
      catchError(() => [0])
    );

    const partiesCount$ = this.http.get<any>(`${this.API_BASE}/parties/new-count`).pipe(
      map(response => response.data?.count || 0),
      catchError(() => [0])
    );

    return new Observable(observer => {
      Promise.all([
        contactsCount$.toPromise(),
        partiesCount$.toPromise()
      ]).then(([contacts, parties]) => {
        const counts = { contacts: contacts || 0, parties: parties || 0 };
        this.countsSubject.next(counts);
        observer.next(counts);
        observer.complete();
      }).catch(error => {
        console.error('Error fetching notification counts:', error);
        observer.error(error);
      });
    });
  }

  markContactsAsViewed(): void {
    // When user visits the contacts page, mark them as viewed
    this.updateCounts({ contacts: 0, parties: this.countsSubject.value.parties });
  }

  markPartiesAsViewed(): void {
    // When user visits the parties page, mark them as viewed
    this.updateCounts({ contacts: this.countsSubject.value.contacts, parties: 0 });
  }

  private updateCounts(counts: NotificationCounts): void {
    this.countsSubject.next(counts);
  }

  getCurrentCounts(): NotificationCounts {
    return this.countsSubject.value;
  }
}