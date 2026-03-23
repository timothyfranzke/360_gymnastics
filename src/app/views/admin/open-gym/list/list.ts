import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OpenGymService, OpenGymData, AgeGroup } from '../../../../services/open-gym';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../interfaces/api';

@Component({
  selector: 'app-open-gym-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
  imports: [CommonModule, RouterLink]
})
export class OpenGymList implements OnInit, OnDestroy {
  openGymData: OpenGymData | null = null;
  isLoading = true;
  error: string | null = null;
  currentUser: User | null = null;
  notification: { message: string; type: 'success' | 'error' } | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private openGymService: OpenGymService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    this.openGymService.getAllData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.openGymData = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load open gym data', error);
          this.error = error.message || 'Failed to load open gym data';
          this.isLoading = false;
        }
      });
  }

  deleteAgeGroup(ageGroup: AgeGroup): void {
    if (!confirm(`Are you sure you want to delete "${ageGroup.title}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    this.openGymService.deleteAgeGroup(ageGroup.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadData();
          this.showNotification(`Age group "${ageGroup.title}" has been deleted.`, 'success');
        },
        error: (error) => {
          console.error('Failed to delete age group', error);
          this.showNotification('Failed to delete age group: ' + error.message, 'error');
        }
      });
  }

  getColorBadgeClass(colorTheme: string): string {
    const colorMap: { [key: string]: string } = {
      'cyan': 'bg-cyan-100 text-cyan-800',
      'orange': 'bg-orange-100 text-orange-800',
      'purple': 'bg-purple-100 text-purple-800',
      'pink': 'bg-pink-100 text-pink-800',
      'green': 'bg-green-100 text-green-800',
      'blue': 'bg-blue-100 text-blue-800'
    };
    
    return colorMap[colorTheme] || colorMap['cyan'];
  }

  getSortedAgeGroups(): AgeGroup[] {
    if (!this.openGymData?.ageGroups) return [];
    return [...this.openGymData.ageGroups].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  dismissNotification(): void {
    this.notification = null;
  }
}