import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { ClassesService } from '../../../services/classes';
import { Class } from '../../../interface/class';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { JackrabbitService } from '../../../services/jackrabbits';
import { Notifications } from '../../../services/notifications';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss'],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out'),
      ]),
    ]),
    trigger('fadeInUpDelay', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms 200ms ease-out'),
      ]),
    ]),
    trigger('fadeInUpDelay2', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms 300ms ease-out'),
      ]),
    ]),
    trigger('fadeInRight', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('600ms 400ms ease-out'),
      ]),
    ]),
    trigger('fadeInUpDelay3', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms 500ms ease-out'),
      ]),
    ]),
    trigger('fadeInUpDelay4', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms 600ms ease-out'),
      ]),
    ]),
  ],
})
export class Detail implements OnInit, OnDestroy {
  classData: Class = {} as Class;
  animationState = 'in';
  isLoading = true;
  error: string | null = null;
  schedule: any[] = [];
  notification: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    public route: ActivatedRoute,
    private classesService: ClassesService,
    private http: HttpClient,
    private notificationsService: Notifications,
    private jackrabbitService: JackrabbitService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const classId = params['id'];
      if (classId) {
        this.loadClassDetail(classId);
        this.loadJackRabbitSchedule();
        this.notification = this.notificationsService.getNotification("classes", classId);
        console.log(this.notification);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClassDetail(classId: string): void {
    this.isLoading = true;
    this.error = null;

    this.classData = this.classesService.getClass(classId);
    this.isLoading = false;
  }

  scrollToSchedule(): void {
    const element = document.getElementById('class-schedule');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getJackRabbitScheduleUrl(): string {
    return 'https://app.jackrabbitclass.com/Openings.asp?id=514082&Cat1=Parent%20Tot&sortcols=Day&hidecols=Class%20Ends,Class%20Starts,Class%20Starts,Description,Session';
  }

  loadJackRabbitSchedule(): void {
    this.jackrabbitService.getJackrabbitSchedule(this.classData.name).subscribe({
      next: (data) => {
        // Sort the data by day and then by time
        this.schedule = this.sortScheduleByDayAndTime(data);
        console.log('JackRabbit schedule loaded successfully', this.schedule);
      },
      error: (error) => {
        console.error('Error loading JackRabbit schedule:', error);
      },
    });
  }

  dismissNotification(): void {
    this.notification = null;
  }

  // Helper method to sort schedule by day and time
  private sortScheduleByDayAndTime(schedule: any[]): any[] {
    // Define day order for sorting (Sunday first, then Monday, etc.)
    const dayOrder: {[key: string]: number} = {
      'Sun': 0,
      'Mon': 1,
      'Tue': 2,
      'Wed': 3,
      'Thu': 4,
      'Fri': 5,
      'Sat': 6
    };

    return [...schedule].sort((a, b) => {
      // First sort by day
      const dayA = a.day && dayOrder.hasOwnProperty(a.day) ? dayOrder[a.day] : 999;
      const dayB = b.day && dayOrder.hasOwnProperty(b.day) ? dayOrder[b.day] : 999;
      
      if (dayA !== dayB) {
        return dayA - dayB;
      }
      
      // If same day, sort by time
      const timeA = this.parseTimeToMinutes(a.time);
      const timeB = this.parseTimeToMinutes(b.time);
      
      return timeA - timeB;
    });
  }

  // Helper method to parse time string to minutes for comparison
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