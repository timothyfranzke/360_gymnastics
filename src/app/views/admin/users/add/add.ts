import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { RegisterRequest } from '../../../../interfaces/api';

@Component({
  selector: 'app-user-add',
  templateUrl: './add.html',
  styleUrls: ['./add.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class UserAdd implements OnInit, OnDestroy {
  userForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      first_name: ['', [Validators.required, Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.maxLength(50)]],
      role: ['staff', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Component initialized
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData = { ...this.userForm.value };
    delete formData.confirmPassword; // Remove confirm password from request

    const userData: RegisterRequest = formData;
    
    this.apiService.registerUser(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdUser) => {
          console.log('User created successfully', createdUser);
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Failed to create user', error);
          this.error = error.message || 'Failed to create user';
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