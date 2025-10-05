import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { of } from 'rxjs';
import { ClassesService } from '../../../services/classes';
import { Class } from '../../../interface/class';
import { CommonModule } from '@angular/common';
import { JackrabbitService } from '../../../services/jackrabbits';
import { Notifications } from '../../../services/notifications';
import { ClassScheduleItem } from '../../../interfaces/api';

// Interface for notifications from the notification service
interface NotificationItem {
  screen: string;
  id: string;
  message: string;
}

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
  schedule: ClassScheduleItem[] = [];
  isScheduleLoading = false;
  scheduleError: string | null = null;
  notification: NotificationItem | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    public route: ActivatedRoute,
    private classesService: ClassesService,
    private notificationsService: Notifications,
    private jackrabbitService: JackrabbitService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const classId = params['id'];
      if (classId) {
        this.loadClassDetail(classId);
        this.loadJackRabbitSchedule();
        this.notification = this.notificationsService.getNotification("classes", classId) || null;
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
    this.isScheduleLoading = true;
    this.scheduleError = null;
    
    this.jackrabbitService.getJackrabbitSchedule(this.classData.name)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading JackRabbit schedule:', error);
          this.scheduleError = 'Failed to load class schedule. Please try again later.';
          return of([]);
        }),
        finalize(() => {
          this.isScheduleLoading = false;
        })
      )
      .subscribe({
        next: (data: ClassScheduleItem[]) => {
          this.schedule = data; // Service already handles sorting
          console.log('JackRabbit schedule loaded successfully', this.schedule);
        }
      });
  }

  dismissNotification(): void {
    this.notification = null;
  }

  /**
   * Retry loading the schedule in case of errors
   */
  retryLoadSchedule(): void {
    this.loadJackRabbitSchedule();
  }
}