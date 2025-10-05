import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { GymHours, BulkUpdateHoursRequest } from '../../../../interfaces/api';

@Component({
  selector: 'app-hours-management',
  templateUrl: './management.html',
  styleUrls: ['./management.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class HoursManagement implements OnInit, OnDestroy {
  hoursForm: FormGroup;
  gymHours: GymHours[] = [];
  isLoading = true;
  isSaving = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.hoursForm = this.fb.group({});
    
    // Initialize form controls for each day
    this.daysOfWeek.forEach(day => {
      this.hoursForm.addControl(`${day.key}_open_time`, this.fb.control('06:00', [Validators.required]));
      this.hoursForm.addControl(`${day.key}_close_time`, this.fb.control('22:00', [Validators.required]));
      this.hoursForm.addControl(`${day.key}_is_closed`, this.fb.control(false));
    });
  }

  ngOnInit(): void {
    this.loadGymHours();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGymHours(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService.getWeekHours()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hours) => {
          this.gymHours = hours;
          this.populateForm(hours);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load gym hours', error);
          this.error = error.message || 'Failed to load gym hours';
          this.isLoading = false;
        }
      });
  }

  populateForm(hours: GymHours[]): void {
    hours.forEach(hour => {
      this.hoursForm.patchValue({
        [`${hour.day_of_week}_open_time`]: hour.open_time,
        [`${hour.day_of_week}_close_time`]: hour.close_time,
        [`${hour.day_of_week}_is_closed`]: hour.is_closed
      });
    });
  }

  onSubmit(): void {
    if (this.hoursForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.error = null;

    const hoursData = this.daysOfWeek.map(day => ({
      day_of_week: day.key,
      open_time: this.hoursForm.get(`${day.key}_open_time`)?.value || '06:00',
      close_time: this.hoursForm.get(`${day.key}_close_time`)?.value || '22:00',
      is_closed: this.hoursForm.get(`${day.key}_is_closed`)?.value || false
    }));

    const bulkRequest: BulkUpdateHoursRequest = {
      hours: hoursData
    };

    this.apiService.bulkUpdateHours(bulkRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedHours) => {
          this.gymHours = updatedHours;
          this.isSaving = false;
          // Show success message (you could add a toast service here)
          alert('Gym hours updated successfully!');
        },
        error: (error) => {
          console.error('Failed to update gym hours', error);
          this.error = error.message || 'Failed to update gym hours';
          this.isSaving = false;
        }
      });
  }

  toggleDayClosure(day: string): void {
    const isClosedControl = this.hoursForm.get(`${day}_is_closed`);
    if (isClosedControl) {
      isClosedControl.setValue(!isClosedControl.value);
    }
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
}