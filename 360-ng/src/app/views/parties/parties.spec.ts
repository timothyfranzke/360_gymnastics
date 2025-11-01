import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Parties } from './parties';

describe('Parties', () => {
  let component: Parties;
  let fixture: ComponentFixture<Parties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Parties, ReactiveFormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Parties);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.partyForm).toBeDefined();
    expect(component.partyForm.get('parentName')?.value).toBe('');
    expect(component.partyForm.get('email')?.value).toBe('');
    expect(component.partyForm.get('phone')?.value).toBe('');
  });

  it('should require parent name', () => {
    const parentNameControl = component.partyForm.get('parentName');
    parentNameControl?.setValue('');
    parentNameControl?.markAsTouched();
    
    expect(component.hasFieldError('parentName')).toBe(true);
    expect(component.getFieldError('parentName')).toContain('required');
  });

  it('should validate email format', () => {
    const emailControl = component.partyForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();
    
    expect(component.hasFieldError('email')).toBe(true);
    expect(component.getFieldError('email')).toContain('valid email');
  });

  it('should validate phone number format', () => {
    const phoneControl = component.partyForm.get('phone');
    phoneControl?.setValue('123');
    phoneControl?.markAsTouched();
    
    expect(component.hasFieldError('phone')).toBe(true);
    expect(component.getFieldError('phone')).toContain('valid phone');
  });

  it('should validate child age range', () => {
    const ageControl = component.partyForm.get('childAge');
    ageControl?.setValue(25);
    ageControl?.markAsTouched();
    
    expect(component.hasFieldError('childAge')).toBe(true);
    expect(component.getFieldError('childAge')).toContain('no more than');
  });

  it('should submit form when valid', () => {
    spyOn(console, 'log');
    
    // Fill out form with valid data
    component.partyForm.patchValue({
      parentName: 'John Doe',
      phone: '555-123-4567',
      canText: 'yes',
      email: 'john@example.com',
      city: 'Kansas City',
      partyType: 'private',
      requestedDate: '2024-12-25',
      requestedTime: '14:00',
      childName: 'Jane Doe',
      childAge: 8,
      estimatedChildren: 12,
      additionalDetails: 'Special requests here'
    });

    component.onSubmit();
    
    expect(component.isSubmitting).toBe(true);
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    
    expect(component.isSubmitting).toBe(false);
  });

  it('should reset form', () => {
    component.partyForm.patchValue({
      parentName: 'Test Name',
      email: 'test@example.com'
    });
    
    component.resetForm();
    
    expect(component.partyForm.get('parentName')?.value).toBe('');
    expect(component.partyForm.get('email')?.value).toBe('');
    expect(component.submitSuccess).toBe(false);
    expect(component.submitError).toBe('');
  });
});