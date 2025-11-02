import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ClassesService } from '../../../../services/classes';
import { Class } from '../../../../interface/class';
import { UpdateClassRequest } from '../../../../interfaces/api';

@Component({
  selector: 'app-classes-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ClassesEdit implements OnInit, OnDestroy {
  editForm: FormGroup;
  isLoading = false;
  isLoadingClass = true;
  error: string | null = null;
  classData: Class | null = null;
  classId: string = '';
  successMessage: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private classesService: ClassesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editForm = this.fb.group({
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
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.classId = params['id'];
      if (this.classId) {
        this.loadClass();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClass(): void {
    this.isLoadingClass = true;
    this.error = null;

    this.classesService.getClass(this.classId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classData) => {
          this.classData = classData;
          this.populateForm(classData);
          this.isLoadingClass = false;
        },
        error: (error) => {
          console.error('Failed to load class', error);
          this.error = error.message || 'Failed to load class';
          this.isLoadingClass = false;
        }
      });
  }

  populateForm(classData: Class): void {
    // Clear existing form arrays
    this.clearFormArray('skills');
    this.clearFormArray('structure');
    this.clearFormArray('prerequisites');

    // Set basic form values
    this.editForm.patchValue({
      id: classData.id,
      name: classData.name,
      description: classData.description,
      ageRange: classData.ageRange,
      ratio: classData.ratio || '',
      duration: classData.duration || '',
      url: classData.url || '',
      featured: classData.featured || false
    });

    // Populate skills
    if (classData.skills && classData.skills.length > 0) {
      classData.skills.forEach(skill => {
        if (skill && skill.trim()) {
          this.skills.push(this.fb.control(skill, [Validators.required]));
        }
      });
    }
    // Always ensure at least one skill field
    if (this.skills.length === 0) {
      this.skills.push(this.fb.control('', [Validators.required]));
    }

    // Populate structure
    if (classData.structure && classData.structure.length > 0) {
      classData.structure.forEach(item => {
        if (item && item.trim()) {
          this.structure.push(this.fb.control(item, [Validators.required]));
        }
      });
    }
    // Always ensure at least one structure field
    if (this.structure.length === 0) {
      this.structure.push(this.fb.control('', [Validators.required]));
    }

    // Populate prerequisites
    if (classData.prerequisites && classData.prerequisites.length > 0) {
      classData.prerequisites.forEach(prereq => {
        if (prereq && prereq.trim()) {
          this.prerequisites.push(this.fb.control(prereq));
        }
      });
    }
    // Always ensure at least one prerequisite field (can be empty)
    if (this.prerequisites.length === 0) {
      this.prerequisites.push(this.fb.control(''));
    }
    
    // Update form validity after populating
    this.editForm.updateValueAndValidity();
  }

  clearFormArray(arrayName: string): void {
    const formArray = this.editForm.get(arrayName) as FormArray;
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  // FormArray getters
  get skills(): FormArray {
    return this.editForm.get('skills') as FormArray;
  }

  get structure(): FormArray {
    return this.editForm.get('structure') as FormArray;
  }

  get prerequisites(): FormArray {
    return this.editForm.get('prerequisites') as FormArray;
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
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.isLoading || this.successMessage) {
      return; // Prevent double submission
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const formData = this.editForm.value;
    
    // Filter out empty strings from arrays
    const updateData: UpdateClassRequest = {
      ...formData,
      skills: formData.skills.filter((skill: string) => skill.trim() !== ''),
      structure: formData.structure.filter((item: string) => item.trim() !== ''),
      prerequisites: formData.prerequisites.filter((prereq: string) => prereq.trim() !== '')
    };

    this.classesService.updateClass(this.classId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedClass) => {
          this.successMessage = `Class "${updatedClass.name}" has been updated successfully.`;
          // Redirect after showing success message
          setTimeout(() => {
            this.router.navigate(['/admin/classes']);
          }, 1500);
        },
        error: (error) => {
          console.error('Failed to update class', error);
          this.error = error.message || 'Failed to update class';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/classes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
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
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isArrayFieldInvalid(arrayName: string, index: number): boolean {
    const arrayControl = this.editForm.get(arrayName) as FormArray;
    const field = arrayControl.at(index);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
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
    const arrayControl = this.editForm.get(arrayName) as FormArray;
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

}