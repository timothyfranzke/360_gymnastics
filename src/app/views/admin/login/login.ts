import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AdminLogin implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  returnUrl: string = '/admin/dashboard';
  showPassword = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
    
    // Show message if provided in query params
    const message = this.route.snapshot.queryParams['message'];
    if (message) {
      this.error = message;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          console.log('Login successful', user);
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Login failed', error);
          this.error = error.message || 'Login failed. Please try again.';
          this.isLoading = false;
        }
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${minLength} characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'Username',
      password: 'Password'
    };
    return displayNames[fieldName] || fieldName;
  }
}