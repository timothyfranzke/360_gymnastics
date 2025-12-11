import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { User } from '../../../../interfaces/api';

interface UpdateUserRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'staff';
  password?: string;
}

@Component({
  selector: 'app-user-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class UserEdit implements OnInit, OnDestroy {
  userForm: FormGroup;
  isLoading = false;
  isLoadingUser = true;
  error: string | null = null;
  user: User | null = null;
  userId: number | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      first_name: ['', [Validators.required, Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.maxLength(50)]],
      role: ['staff', [Validators.required]],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
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
          this.populateForm();
          this.isLoadingUser = false;
        },
        error: (error) => {
          console.error('Failed to load user', error);
          this.error = error.message || 'Failed to load user';
          this.isLoadingUser = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value && confirmPassword.value && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  populateForm(): void {
    if (!this.user) return;
    
    this.userForm.patchValue({
      username: this.user.username,
      email: this.user.email,
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      role: this.user.role
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid || !this.userId) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData = { ...this.userForm.value };
    delete formData.confirmPassword; // Remove confirm password from request
    
    // Only include password if it's provided
    if (!formData.password) {
      delete formData.password;
    }

    const userData: UpdateUserRequest = formData;
    
    this.apiService.updateUser(this.userId, userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          console.log('User updated successfully', updatedUser);
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Failed to update user', error);
          this.error = error.message || 'Failed to update user';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${minLength} characters`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
      }
      if (field.errors['email']) {
        return `${this.getFieldDisplayName(fieldName)} must be a valid email address`;
      }
    }
    
    // Check form-level password mismatch error
    if (fieldName === 'confirmPassword' && this.userForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      first_name: 'First Name',
      last_name: 'Last Name',
      role: 'Role'
    };
    return displayNames[fieldName] || fieldName;
  }
}