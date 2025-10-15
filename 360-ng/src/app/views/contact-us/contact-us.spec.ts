import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { ContactUs } from './contact-us';
import { ContactService } from '../../services/contact.service';
import { ContactFormRequest, ContactFormResponse } from '../../interfaces/api';

describe('ContactUs', () => {
  let component: ContactUs;
  let fixture: ComponentFixture<ContactUs>;
  let contactService: jasmine.SpyObj<ContactService>;

  const mockSuccessResponse: ContactFormResponse = {
    success: true,
    message: 'Message sent successfully',
    reference_id: 'TEST-123'
  };

  beforeEach(async () => {
    const contactServiceSpy = jasmine.createSpyObj('ContactService', ['submitContactForm']);

    await TestBed.configureTestingModule({
      imports: [ContactUs, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ContactService, useValue: contactServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactUs);
    component = fixture.componentInstance;
    contactService = TestBed.inject(ContactService) as jasmine.SpyObj<ContactService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values and validators', () => {
    expect(component.contactForm).toBeDefined();
    expect(component.contactForm.get('name')?.value).toBe('');
    expect(component.contactForm.get('email')?.value).toBe('');
    expect(component.contactForm.get('subject')?.value).toBe('');
    expect(component.contactForm.get('message')?.value).toBe('');

    // Check required validators
    expect(component.contactForm.get('name')?.hasError('required')).toBe(true);
    expect(component.contactForm.get('email')?.hasError('required')).toBe(true);
    expect(component.contactForm.get('message')?.hasError('required')).toBe(true);
  });

  it('should validate name field correctly', () => {
    const nameControl = component.contactForm.get('name');
    
    // Test required validation
    expect(nameControl?.hasError('required')).toBe(true);
    
    // Test minimum length
    nameControl?.setValue('A');
    expect(nameControl?.hasError('minlength')).toBe(true);
    
    // Test valid name
    nameControl?.setValue('John Doe');
    expect(nameControl?.valid).toBe(true);
    
    // Test maximum length
    const longName = 'A'.repeat(101);
    nameControl?.setValue(longName);
    expect(nameControl?.hasError('maxlength')).toBe(true);
  });

  it('should validate email field correctly', () => {
    const emailControl = component.contactForm.get('email');
    
    // Test required validation
    expect(emailControl?.hasError('required')).toBe(true);
    
    // Test invalid email format
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
    
    // Test valid email
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate message field correctly', () => {
    const messageControl = component.contactForm.get('message');
    
    // Test required validation
    expect(messageControl?.hasError('required')).toBe(true);
    
    // Test minimum length
    messageControl?.setValue('Short');
    expect(messageControl?.hasError('minlength')).toBe(true);
    
    // Test valid message
    messageControl?.setValue('This is a valid message with enough characters.');
    expect(messageControl?.valid).toBe(true);
    
    // Test maximum length
    const longMessage = 'A'.repeat(2001);
    messageControl?.setValue(longMessage);
    expect(messageControl?.hasError('maxlength')).toBe(true);
  });

  it('should show field errors when form is touched', () => {
    const nameControl = component.contactForm.get('name');
    nameControl?.markAsTouched();
    
    expect(component.hasFieldError('name')).toBe(true);
    expect(component.getFieldError('name')).toBe('Name is required');
  });

  it('should return correct error messages for different validation errors', () => {
    // Name errors
    const nameControl = component.contactForm.get('name');
    nameControl?.markAsTouched();
    expect(component.getFieldError('name')).toBe('Name is required');
    
    nameControl?.setValue('A');
    expect(component.getFieldError('name')).toBe('Name must be at least 2 characters');
    
    // Email errors
    const emailControl = component.contactForm.get('email');
    emailControl?.markAsTouched();
    expect(component.getFieldError('email')).toBe('Email address is required');
    
    emailControl?.setValue('invalid');
    expect(component.getFieldError('email')).toBe('Please enter a valid email address');
  });

  it('should track message character count correctly', () => {
    const messageControl = component.contactForm.get('message');
    
    expect(component.getMessageCharCount()).toBe(0);
    
    messageControl?.setValue('Hello world');
    expect(component.getMessageCharCount()).toBe(11);
    
    expect(component.isMessageNearLimit()).toBe(false);
    
    const longMessage = 'A'.repeat(1850);
    messageControl?.setValue(longMessage);
    expect(component.isMessageNearLimit()).toBe(true);
  });

  it('should prevent submission when form is invalid', () => {
    const markAllSpy = spyOn(component as any, 'markAllFieldsAsTouched');
    
    component.onSubmit();
    
    expect(markAllSpy).toHaveBeenCalled();
    expect(contactService.submitContactForm).not.toHaveBeenCalled();
  });

  it('should submit valid form successfully', () => {
    // Set up valid form data
    component.contactForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.'
    });

    contactService.submitContactForm.and.returnValue(of(mockSuccessResponse));

    component.onSubmit();

    expect(component.isSubmitting).toBe(true);
    expect(contactService.submitContactForm).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.'
    });
  });

  it('should handle successful form submission', () => {
    component.contactForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a test message with enough characters.'
    });

    contactService.submitContactForm.and.returnValue(of(mockSuccessResponse));
    spyOn(window, 'scrollTo');

    component.onSubmit();

    expect(component.submitSuccess).toBe(true);
    expect(component.referenceId).toBe('TEST-123');
    expect(component.isSubmitting).toBe(false);
    expect(component.contactForm.pristine).toBe(true); // Form should be reset
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should handle form submission error', () => {
    component.contactForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a test message with enough characters.'
    });

    const errorMessage = 'Network error occurred';
    contactService.submitContactForm.and.returnValue(throwError(() => new Error(errorMessage)));

    component.onSubmit();

    expect(component.submitError).toBe(errorMessage);
    expect(component.isSubmitting).toBe(false);
    expect(component.submitSuccess).toBe(false);
  });

  it('should reset form and clear messages', () => {
    component.submitSuccess = true;
    component.submitError = 'Some error';
    component.referenceId = 'TEST-123';
    
    component.resetForm();
    
    expect(component.submitSuccess).toBe(false);
    expect(component.submitError).toBeNull();
    expect(component.referenceId).toBeNull();
    expect(component.contactForm.pristine).toBe(true);
  });

  it('should handle gym contact actions', () => {
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
    spyOn(window, 'open');

    // Test phone call
    component.callGym();
    expect(window.location.href).toBe('tel:(913) 782-3300');

    // Test email
    component.emailGym();
    expect(window.location.href).toBe('mailto:kc360gym@gmail.com');

    // Test directions
    component.getDirections();
    expect(window.open).toHaveBeenCalledWith(
      'https://maps.google.com/maps?daddr=431%20N%20Lindenwood%20Dr%2C%20Olathe%2C%20KS%2066062',
      '_blank'
    );
  });

  it('should have correct gym information', () => {
    expect(component.gymInfo.address).toBe('431 N Lindenwood Dr, Olathe, KS 66062');
    expect(component.gymInfo.phone).toBe('(913) 782-3300');
    expect(component.gymInfo.email).toBe('kc360gym@gmail.com');
    expect(component.gymInfo.mapEmbedUrl).toContain('google.com/maps/embed');
  });

  it('should trim form values before submission', () => {
    component.contactForm.patchValue({
      name: '  John Doe  ',
      email: '  john@example.com  ',
      subject: '  Test Subject  ',
      message: '  This is a test message with enough characters.  '
    });

    contactService.submitContactForm.and.returnValue(of(mockSuccessResponse));

    component.onSubmit();

    const expectedData: ContactFormRequest = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.'
    };

    expect(contactService.submitContactForm).toHaveBeenCalledWith(expectedData);
  });

  it('should handle empty subject field correctly', () => {
    component.contactForm.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      subject: '',
      message: 'This is a test message with enough characters.'
    });

    contactService.submitContactForm.and.returnValue(of(mockSuccessResponse));

    component.onSubmit();

    const expectedData: ContactFormRequest = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: undefined,
      message: 'This is a test message with enough characters.'
    };

    expect(contactService.submitContactForm).toHaveBeenCalledWith(expectedData);
  });
});
