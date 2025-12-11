import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { OpenGymService, OpenGymData, OpenGymConfig as IOpenGymConfig } from '../../../../services/open-gym';

@Component({
  selector: 'app-open-gym-config',
  templateUrl: './config.html',
  styleUrls: ['./config.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class OpenGymConfigComponent implements OnInit, OnDestroy {
  mainConfigForm: FormGroup;
  structuredConfigForm: FormGroup;
  isLoading = true;
  isSubmittingMain = false;
  isSubmittingStructured = false;
  error: string | null = null;
  notification: { message: string; type: 'success' | 'error' } | null = null;
  openGymData: OpenGymData | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private openGymService: OpenGymService,
    private router: Router
  ) {
    this.mainConfigForm = this.createConfigForm();
    this.structuredConfigForm = this.createConfigForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createConfigForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.maxLength(200)]],
      subtitle: ['', [Validators.maxLength(500)]],
      description: [''],
      features: this.fb.array([]),
      importantInfo: this.fb.array([])
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    this.openGymService.getAllData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.openGymData = data;
          this.populateForms(data);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load open gym data', error);
          this.error = error.message || 'Failed to load open gym data';
          this.isLoading = false;
        }
      });
  }

  populateForms(data: OpenGymData): void {
    // Populate main config form
    if (data.mainConfig) {
      this.mainConfigForm.patchValue({
        title: data.mainConfig.title || '',
        subtitle: data.mainConfig.subtitle || '',
        description: data.mainConfig.description || ''
      });
      this.setFormArrayValues(this.mainConfigForm, 'features', data.mainConfig.features || []);
      this.setFormArrayValues(this.mainConfigForm, 'importantInfo', data.mainConfig.importantInfo || []);
    }

    // Populate structured config form
    if (data.structuredConfig) {
      this.structuredConfigForm.patchValue({
        title: data.structuredConfig.title || '',
        subtitle: data.structuredConfig.subtitle || '',
        description: data.structuredConfig.description || ''
      });
      this.setFormArrayValues(this.structuredConfigForm, 'features', data.structuredConfig.features || []);
      this.setFormArrayValues(this.structuredConfigForm, 'importantInfo', data.structuredConfig.importantInfo || []);
    }
  }

  setFormArrayValues(form: FormGroup, arrayName: string, values: string[]): void {
    const formArray = form.get(arrayName) as FormArray;
    formArray.clear();
    
    values.forEach(value => {
      formArray.push(this.fb.control(value, [Validators.required]));
    });
  }

  // Form Array Helpers
  getFeaturesFormArray(form: FormGroup): FormArray {
    return form.get('features') as FormArray;
  }

  getImportantInfoFormArray(form: FormGroup): FormArray {
    return form.get('importantInfo') as FormArray;
  }

  addFeature(form: FormGroup): void {
    this.getFeaturesFormArray(form).push(this.fb.control('', [Validators.required]));
  }

  removeFeature(form: FormGroup, index: number): void {
    this.getFeaturesFormArray(form).removeAt(index);
  }

  addImportantInfo(form: FormGroup): void {
    this.getImportantInfoFormArray(form).push(this.fb.control('', [Validators.required]));
  }

  removeImportantInfo(form: FormGroup, index: number): void {
    this.getImportantInfoFormArray(form).removeAt(index);
  }

  // Submit handlers
  onSubmitMainConfig(): void {
    if (this.mainConfigForm.invalid) {
      this.markFormGroupTouched(this.mainConfigForm);
      return;
    }

    this.isSubmittingMain = true;
    this.error = null;

    const formData = this.prepareFormData(this.mainConfigForm);

    this.openGymService.updateMainConfig(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showNotification('Main configuration updated successfully', 'success');
          this.loadData(); // Reload to get updated data
          this.isSubmittingMain = false;
        },
        error: (error) => {
          console.error('Failed to update main configuration', error);
          this.error = error.message || 'Failed to update main configuration';
          this.isSubmittingMain = false;
        }
      });
  }

  onSubmitStructuredConfig(): void {
    if (this.structuredConfigForm.invalid) {
      this.markFormGroupTouched(this.structuredConfigForm);
      return;
    }

    this.isSubmittingStructured = true;
    this.error = null;

    const formData = this.prepareFormData(this.structuredConfigForm);

    this.openGymService.updateStructuredConfig(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showNotification('Structured configuration updated successfully', 'success');
          this.loadData(); // Reload to get updated data
          this.isSubmittingStructured = false;
        },
        error: (error) => {
          console.error('Failed to update structured configuration', error);
          this.error = error.message || 'Failed to update structured configuration';
          this.isSubmittingStructured = false;
        }
      });
  }

  prepareFormData(form: FormGroup): Partial<IOpenGymConfig> {
    const formValue = form.value;
    return {
      title: formValue.title || null,
      subtitle: formValue.subtitle || null,
      description: formValue.description || null,
      features: formValue.features.filter((f: string) => f.trim() !== ''),
      importantInfo: formValue.importantInfo.filter((i: string) => i.trim() !== '')
    };
  }

  onCancel(): void {
    this.router.navigate(['/admin/open-gym']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} is too long`;
    }
    return '';
  }

  getArrayFieldError(formArray: FormArray, index: number): string {
    const control = formArray.at(index);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      subtitle: 'Subtitle', 
      description: 'Description'
    };
    return labels[fieldName] || fieldName;
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  dismissNotification(): void {
    this.notification = null;
  }
}