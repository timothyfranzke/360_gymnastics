import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { Announcement, UpdateAnnouncementRequest } from '../../../../interfaces/api';

@Component({
  selector: 'app-announcement-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AnnouncementEdit implements OnInit, OnDestroy {
  editForm: FormGroup;
  isLoading = false;
  isLoadingData = true;
  error: string | null = null;
  announcement: Announcement | null = null;
  announcementId: number = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      content: ['', [Validators.required]],
      type: ['general', [Validators.required]],
      priority: ['medium', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.announcementId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAnnouncement();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnnouncement(): void {
    this.isLoadingData = true;
    this.error = null;

    this.apiService.getAnnouncement(this.announcementId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (announcement) => {
          this.announcement = announcement;
          this.editForm.patchValue({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            priority: announcement.priority,
            start_date: announcement.start_date,
            end_date: announcement.end_date,
            is_active: announcement.is_active
          });
          this.isLoadingData = false;
        },
        error: (error) => {
          console.error('Failed to load announcement', error);
          this.error = error.message || 'Failed to load announcement';
          this.isLoadingData = false;
        }
      });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData: UpdateAnnouncementRequest = this.editForm.value;

    this.apiService.updateAnnouncement(this.announcementId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/announcements']);
        },
        error: (error) => {
          console.error('Failed to update announcement', error);
          this.error = error.message || 'Failed to update announcement';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/announcements']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      title: 'Title',
      content: 'Content',
      type: 'Type',
      priority: 'Priority',
      start_date: 'Start Date',
      end_date: 'End Date'
    };
    return displayNames[fieldName] || fieldName;
  }
}