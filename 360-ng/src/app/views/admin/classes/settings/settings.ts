import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ClassesService } from '../../../../services/classes';
import { ClassPageSettings, PricingTier } from '../../../../interfaces/api';

@Component({
  selector: 'app-classes-settings',
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ClassesSettings implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  isLoading = false;
  isLoadingSettings = true;
  error: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private classesService: ClassesService,
    private router: Router
  ) {
    this.settingsForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      pricing_tiers: this.fb.array([]),
      registration_fee: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get pricingTiers(): FormArray {
    return this.settingsForm.get('pricing_tiers') as FormArray;
  }

  loadSettings(): void {
    this.isLoadingSettings = true;
    this.error = null;

    this.classesService.getClassPageSettingsAdmin()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.populateForm(settings);
          this.isLoadingSettings = false;
        },
        error: (error) => {
          console.error('Failed to load settings', error);
          this.error = error.message || 'Failed to load settings';
          this.isLoadingSettings = false;
          // Initialize with empty form on error
          this.addPricingTier();
        }
      });
  }

  populateForm(settings: ClassPageSettings): void {
    this.settingsForm.patchValue({
      description: settings.description || '',
      registration_fee: settings.registration_fee || ''
    });

    // Clear existing pricing tiers
    while (this.pricingTiers.length !== 0) {
      this.pricingTiers.removeAt(0);
    }

    // Add pricing tiers from settings
    if (settings.pricing_tiers && settings.pricing_tiers.length > 0) {
      settings.pricing_tiers.forEach(tier => {
        this.pricingTiers.push(this.createPricingTierGroup(tier));
      });
    } else {
      // Add one empty tier if none exist
      this.addPricingTier();
    }
  }

  createPricingTierGroup(tier?: PricingTier): FormGroup {
    return this.fb.group({
      duration: [tier?.duration || '', [Validators.required]],
      price: [tier?.price || '', [Validators.required]]
    });
  }

  addPricingTier(): void {
    this.pricingTiers.push(this.createPricingTierGroup());
  }

  removePricingTier(index: number): void {
    if (this.pricingTiers.length > 1) {
      this.pricingTiers.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.isLoading || this.successMessage) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const formData = this.settingsForm.value;

    // Filter out empty pricing tiers
    const settings: Partial<ClassPageSettings> = {
      description: formData.description,
      pricing_tiers: formData.pricing_tiers.filter(
        (tier: PricingTier) => tier.duration.trim() !== '' && tier.price.trim() !== ''
      ),
      registration_fee: formData.registration_fee
    };

    this.classesService.updateClassPageSettings(settings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Class page settings updated successfully.';
          this.isLoading = false;
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (error) => {
          console.error('Failed to update settings', error);
          this.error = error.message || 'Failed to update settings';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/classes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.settingsForm.controls).forEach(key => {
      const control = this.settingsForm.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(subKey => {
              arrayControl.get(subKey)?.markAsTouched();
            });
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.settingsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isTierFieldInvalid(index: number, fieldName: string): boolean {
    const tier = this.pricingTiers.at(index) as FormGroup;
    const field = tier.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.settingsForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'This field is required';
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `Cannot exceed ${maxLength} characters`;
      }
    }
    return '';
  }
}
