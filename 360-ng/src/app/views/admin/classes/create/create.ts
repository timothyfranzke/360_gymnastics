import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ClassesService } from '../../../../services/classes';
import { Class } from '../../../../interface/class';
import { CreateClassRequest } from '../../../../interfaces/api';

@Component({
  selector: 'app-classes-create',
  templateUrl: './create.html',
  styleUrls: ['./create.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ClassesCreate implements OnInit, OnDestroy {
  createForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private classesService: ClassesService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      id: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      ageRange: ['', [Validators.required, Validators.maxLength(100)]],
      ratio: ['', [Validators.maxLength(50)]],
      duration: ['', [Validators.maxLength(100)]],
      url: ['', [this.urlValidator]],
      featured: [false],
      skills: this.fb.array([]),
      structure: this.fb.array([]),
      prerequisites: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Add initial empty fields
    this.addSkill();
    this.addStructureItem();
    this.addPrerequisite();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // FormArray getters
  get skills(): FormArray {
    return this.createForm.get('skills') as FormArray;
  }

  get structure(): FormArray {
    return this.createForm.get('structure') as FormArray;
  }

  get prerequisites(): FormArray {
    return this.createForm.get('prerequisites') as FormArray;
  }

  // Skills management
  addSkill(): void {
    this.skills.push(this.fb.control('', [Validators.required]));
  }

  removeSkill(index: number): void {
    if (this.skills.length > 1) {
      this.skills.removeAt(index);
    }
  }

  // Structure management
  addStructureItem(): void {
    this.structure.push(this.fb.control('', [Validators.required]));
  }

  removeStructureItem(index: number): void {
    if (this.structure.length > 1) {
      this.structure.removeAt(index);
    }
  }

  // Prerequisites management
  addPrerequisite(): void {
    this.prerequisites.push(this.fb.control(''));
  }

  removePrerequisite(index: number): void {
    this.prerequisites.removeAt(index);
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.isLoading || this.successMessage) {
      return; // Prevent double submission
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const formData = this.createForm.value;
    
    // Filter out empty strings from arrays
    const classData: CreateClassRequest = {
      ...formData,
      skills: formData.skills.filter((skill: string) => skill.trim() !== ''),
      structure: formData.structure.filter((item: string) => item.trim() !== ''),
      prerequisites: formData.prerequisites.filter((prereq: string) => prereq.trim() !== '')
    };

    this.classesService.createClass(classData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdClass) => {
          this.successMessage = `Class "${createdClass.name}" has been created successfully.`;
          // Redirect after showing success message
          setTimeout(() => {
            this.router.navigate(['/admin/classes']);
          }, 1500);
        },
        error: (error) => {
          console.error('Failed to create class', error);
          this.error = error.message || 'Failed to create class';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/classes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createForm.controls).forEach(key => {
      const control = this.createForm.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => arrayControl.markAsTouched());
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Custom URL validator
  private urlValidator(control: any) {
    if (!control.value || control.value.trim() === '') {
      return null; // URL is optional
    }
    
    try {
      new URL(control.value);
      return null;
    } catch {
      // Try with http prefix
      try {
        new URL('http://' + control.value);
        return null;
      } catch {
        return { invalidUrl: true };
      }
    }
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isArrayFieldInvalid(arrayName: string, index: number): boolean {
    const arrayControl = this.createForm.get(arrayName) as FormArray;
    const field = arrayControl.at(index);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${minLength} characters`;
      }
      if (field.errors['invalidUrl']) {
        return `${this.getFieldDisplayName(fieldName)} must be a valid URL`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldDisplayName(fieldName)} must contain only lowercase letters, numbers, and hyphens`;
      }
    }
    return '';
  }

  getArrayFieldError(arrayName: string, index: number): string {
    const arrayControl = this.createForm.get(arrayName) as FormArray;
    const field = arrayControl.at(index);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `This field is required`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      id: 'Class ID',
      name: 'Class Name',
      description: 'Description',
      ageRange: 'Age Range',
      ratio: 'Student-Teacher Ratio',
      duration: 'Duration',
      url: 'URL',
      featured: 'Featured'
    };
    return displayNames[fieldName] || fieldName;
  }

  // Generate ID suggestion from name
  generateId(): void {
    const name = this.createForm.get('name')?.value || '';
    if (name.trim()) {
      const suggestedId = name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      // Auto-fill the ID field
      this.createForm.patchValue({ id: suggestedId });
    }
  }
}