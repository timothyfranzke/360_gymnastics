import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { ContactFormRequest } from '../../interfaces/api';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss'
})
export class ContactUs implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;
  referenceId: string | null = null;

  // Gym contact information
  readonly gymInfo = {
    address: '431 N Lindenwood Dr, Olathe, KS 66062',
    phone: '(913) 782-3300',
    email: 'kc360gym@gmail.com',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3147.3!2d-94.791!3d38.884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s431%20N%20Lindenwood%20Dr%2C%20Olathe%2C%20KS%2066062!5e0!3m2!1sen!2sus!4v1697000000000!5m2!1sen!2sus'
  };

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      subject: ['', [Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  /**
   * Get form control for easier access in template
   */
  getControl(name: string) {
    return this.contactForm.get(name);
  }

  /**
   * Check if a field has validation errors and has been touched
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.getControl(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get specific error message for a field
   */
  getFieldError(fieldName: string): string {
    const field = this.getControl(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'name':
        if (errors['required']) return 'Name is required';
        if (errors['minlength']) return 'Name must be at least 2 characters';
        if (errors['maxlength']) return 'Name cannot exceed 100 characters';
        break;
      case 'email':
        if (errors['required']) return 'Email address is required';
        if (errors['email']) return 'Please enter a valid email address';
        if (errors['maxlength']) return 'Email cannot exceed 255 characters';
        break;
      case 'subject':
        if (errors['maxlength']) return 'Subject cannot exceed 200 characters';
        break;
      case 'message':
        if (errors['required']) return 'Message is required';
        if (errors['minlength']) return 'Message must be at least 10 characters';
        if (errors['maxlength']) return 'Message cannot exceed 2000 characters';
        break;
    }

    return 'Invalid input';
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = false;

    const formData: ContactFormRequest = {
      name: this.contactForm.value.name.trim(),
      email: this.contactForm.value.email.trim(),
      subject: this.contactForm.value.subject?.trim() || undefined,
      message: this.contactForm.value.message.trim()
    };

    this.contactService.submitContactForm(formData).subscribe({
      next: (response) => {
        this.submitSuccess = true;
        this.referenceId = response.reference_id || null;
        this.contactForm.reset();
        this.isSubmitting = false;
        
        // Scroll to top to show success message
        window.scrollTo(0, 0);
      },
      error: (error) => {
        this.submitError = error.message || 'Failed to send message. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Reset form and clear messages
   */
  resetForm(): void {
    this.contactForm.reset();
    this.submitSuccess = false;
    this.submitError = null;
    this.referenceId = null;
  }

  /**
   * Get character count for message field
   */
  getMessageCharCount(): number {
    return this.getControl('message')?.value?.length || 0;
  }

  /**
   * Check if message is approaching character limit
   */
  isMessageNearLimit(): boolean {
    return this.getMessageCharCount() > 1800; // Warning at 90% of 2000 chars
  }

  /**
   * Handle phone number click
   */
  callGym(): void {
    window.location.href = `tel:${this.gymInfo.phone}`;
  }

  /**
   * Handle email click
   */
  emailGym(): void {
    window.location.href = `mailto:${this.gymInfo.email}`;
  }

  /**
   * Handle map click for directions
   */
  getDirections(): void {
    const encodedAddress = encodeURIComponent(this.gymInfo.address);
    window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
  }
}
