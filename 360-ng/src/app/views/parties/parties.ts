import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ViewHeader } from '../../components/view-header/view-header';

@Component({
  selector: 'app-parties',
  templateUrl: './parties.html',
  styleUrls: ['./parties.scss'],
  imports: [CommonModule, ReactiveFormsModule, ViewHeader]
})
export class Parties implements OnInit {
  partyForm!: FormGroup;
  
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.partyForm = this.fb.group({
      parentName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)]],
      canText: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      partyType: ['', Validators.required],
      requestedDate: ['', Validators.required],
      requestedTime: ['', Validators.required],
      childName: ['', [Validators.required, Validators.minLength(2)]],
      childAge: ['', [Validators.required, Validators.min(1), Validators.max(18)]],
      estimatedChildren: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
      additionalDetails: ['']
    });
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.partyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.partyForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required.`;
    }
    
    if (errors['email']) {
      return 'Please enter a valid email address.';
    }
    
    if (errors['pattern']) {
      if (fieldName === 'phone') {
        return 'Please enter a valid phone number.';
      }
    }
    
    if (errors['minlength']) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters.`;
    }
    
    if (errors['min']) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${errors['min'].min}.`;
    }
    
    if (errors['max']) {
      return `${this.getFieldDisplayName(fieldName)} must be no more than ${errors['max'].max}.`;
    }
    
    return 'This field is invalid.';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      parentName: 'Your name',
      phone: 'Phone number',
      canText: 'Text permission',
      email: 'Email address',
      city: 'City',
      partyType: 'Party type',
      requestedDate: 'Requested date',
      requestedTime: 'Requested time',
      childName: "Child's name",
      childAge: "Child's age",
      estimatedChildren: 'Number of children',
      additionalDetails: 'Additional details'
    };
    
    return displayNames[fieldName] || fieldName;
  }

  onSubmit(): void {
    if (this.partyForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    // Simulate form submission
    setTimeout(() => {
      // In a real application, you would send this data to your backend
      console.log('Party form data:', this.partyForm.value);
      
      // Simulate success/error randomly for demo
      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      if (isSuccess) {
        this.submitSuccess = true;
        this.partyForm.reset();
        this.initializeForm();
      } else {
        this.submitError = 'Unable to send your party request. Please try again or contact us directly.';
      }
      
      this.isSubmitting = false;
    }, 2000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.partyForm.controls).forEach(key => {
      const control = this.partyForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  resetForm(): void {
    this.submitSuccess = false;
    this.submitError = '';
    this.partyForm.reset();
    this.initializeForm();
  }

  scrollToForm(): void {
    const formElement = document.getElementById('party-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}