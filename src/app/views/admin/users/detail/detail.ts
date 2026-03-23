import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../interfaces/api';

@Component({
  selector: 'app-user-detail',
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss'],
  imports: [CommonModule, RouterLink]
})
export class UserDetail implements OnInit, OnDestroy {
  user: User | null = null;
  currentUser: User | null = null;
  isLoading = true;
  error: string | null = null;
  userId: number | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          this.userId = +params['id'];
          return this.apiService.getUser(this.userId);
        })
      )
      .subscribe({
        next: (user: User) => {
          this.user = user;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load user', error);
          this.error = error.message || 'Failed to load user';
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'badge badge-primary';
      case 'staff':
        return 'badge badge-secondary';
      default:
        return 'badge badge-light';
    }
  }

  canEditUser(): boolean {
    if (!this.currentUser || !this.user) return false;
    
    // Admins can edit anyone except themselves
    if (this.currentUser.role === 'admin') {
      return this.currentUser.id !== this.user.id;
    }
    
    // Staff cannot edit users
    return false;
  }

  canDeleteUser(): boolean {
    if (!this.currentUser || !this.user) return false;
    
    // Admins can delete anyone except themselves
    if (this.currentUser.role === 'admin') {
      return this.currentUser.id !== this.user.id;
    }
    
    // Staff cannot delete users
    return false;
  }

  deleteUser(): void {
    if (!this.user || !this.canDeleteUser()) return;

    if (confirm(`Are you sure you want to delete user "${this.user.username}"? This action cannot be undone.`)) {
      this.apiService.deleteUser(this.user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('User deleted successfully');
            this.router.navigate(['/admin/users']);
          },
          error: (error) => {
            console.error('Failed to delete user', error);
            this.error = error.message || 'Failed to delete user';
          }
        });
    }
  }

  editUser(): void {
    if (!this.user || !this.canEditUser()) return;
    this.router.navigate(['/admin/users', this.user.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}