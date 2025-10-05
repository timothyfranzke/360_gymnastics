// src/app/services/jackrabbit.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ClassScheduleItem } from '../interfaces/api';

@Injectable({
  providedIn: 'root',
})
export class JackrabbitService {
  constructor(private apiService: ApiService) {}

  getJackrabbitSchedule(cat1: string): Observable<any> {
    return this.apiService.getClassSchedule(cat1).pipe(
      map((scheduleItems: ClassScheduleItem[]) => {
        // Sort the data to maintain the same ordering as before
        return this.sortScheduleData(scheduleItems);
      })
    );
  }

  /**
   * Sort schedule data by day and time to maintain consistency with previous implementation
   */
  private sortScheduleData(scheduleItems: ClassScheduleItem[]): ClassScheduleItem[] {
    return scheduleItems.sort((a, b) => {
      const dayOrder: {[key: string]: number} = {
        'Sun': 0,
        'Mon': 1,
        'Tue': 2,
        'Wed': 3,
        'Thu': 4,
        'Fri': 5,
        'Sat': 6
      };
      
      const dayA = a.day && dayOrder.hasOwnProperty(a.day) ? dayOrder[a.day] : 999;
      const dayB = b.day && dayOrder.hasOwnProperty(b.day) ? dayOrder[b.day] : 999;
      
      if (dayA !== dayB) {
        return dayA - dayB;
      }
      
      // If same day, sort by time
      return this.parseTimeToMinutes(a.time) - this.parseTimeToMinutes(b.time);
    });
  }

  /**
   * Helper function to parse time string to minutes for comparison
   */
  private parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    
    // Extract hours, minutes, and AM/PM
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const isPM = match[3].toUpperCase() === 'PM';
    
    // Convert to 24-hour format for easier comparison
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  }
}
