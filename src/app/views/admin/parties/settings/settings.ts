import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../../../services/api.service';
import { PartyPageSettings, PartyPackage } from '../../../../interfaces/api';

@Component({
  selector: 'app-parties-settings',
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class PartiesSettings implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  isLoading = false;
  isLoadingSettings = true;
  error: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.settingsForm = this.fb.group({
      intro: ['', [Validators.maxLength(2000)]],
      footer_note: ['', [Validators.maxLength(2000)]],
      packages: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get packages(): FormArray {
    return this.settingsForm.get('packages') as FormArray;
  }

  bulletsAt(index: number): FormArray {
    return this.packages.at(index).get('bullets') as FormArray;
  }

  loadSettings(): void {
    this.isLoadingSettings = true;
    this.error = null;

    this.apiService.getPartyPageSettingsAdmin()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          this.populateForm(settings);
          this.isLoadingSettings = false;
        },
        error: (error) => {
          console.error('Failed to load party page settings', error);
          this.error = error.message || 'Failed to load settings';
          this.isLoadingSettings = false;
          this.addPackage();
        }
      });
  }

  populateForm(settings: PartyPageSettings): void {
    this.settingsForm.patchValue({
      intro: settings.intro || '',
      footer_note: settings.footer_note || ''
    });

    while (this.packages.length !== 0) {
      this.packages.removeAt(0);
    }

    if (settings.packages && settings.packages.length > 0) {
      settings.packages.forEach(pkg => {
        this.packages.push(this.createPackageGroup(pkg));
      });
    } else {
      this.addPackage();
    }
  }

  createPackageGroup(pkg?: PartyPackage): FormGroup {
    const bullets = (pkg?.bullets || []).map(b => new FormControl(b, [Validators.required]));
    return this.fb.group({
      id: [pkg?.id ?? null],
      name: [pkg?.name || '', [Validators.required, Validators.maxLength(255)]],
      price: [pkg?.price || '', [Validators.required, Validators.maxLength(255)]],
      description: [pkg?.description || '', [Validators.maxLength(2000)]],
      bullets: this.fb.array(bullets),
      display_order: [pkg?.display_order ?? this.packages.length + 1],
      active: [pkg?.active ?? true]
    });
  }

  addPackage(): void {
    this.packages.push(this.createPackageGroup());
  }

  removePackage(index: number): void {
    if (this.packages.length > 1) {
      this.packages.removeAt(index);
    }
  }

  movePackageUp(index: number): void {
    if (index <= 0) return;
    const group = this.packages.at(index);
    this.packages.removeAt(index);
    this.packages.insert(index - 1, group);
  }

  movePackageDown(index: number): void {
    if (index >= this.packages.length - 1) return;
    const group = this.packages.at(index);
    this.packages.removeAt(index);
    this.packages.insert(index + 1, group);
  }

  addBullet(packageIndex: number): void {
    this.bulletsAt(packageIndex).push(new FormControl('', [Validators.required]));
  }

  removeBullet(packageIndex: number, bulletIndex: number): void {
    this.bulletsAt(packageIndex).removeAt(bulletIndex);
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      this.markAllTouched();
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const formData = this.settingsForm.value;

    const packages: PartyPackage[] = (formData.packages || []).map((pkg: any, index: number) => ({
      id: pkg.id ?? undefined,
      name: (pkg.name || '').trim(),
      price: (pkg.price || '').trim(),
      description: (pkg.description || '').trim(),
      bullets: (pkg.bullets || [])
        .map((b: string) => (b || '').trim())
        .filter((b: string) => b !== ''),
      display_order: index + 1,
      active: !!pkg.active
    }));

    const settings: Partial<PartyPageSettings> = {
      intro: (formData.intro || '').trim(),
      footer_note: (formData.footer_note || '').trim(),
      packages
    };

    this.apiService.updatePartyPageSettings(settings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (saved) => {
          this.successMessage = 'Party page settings updated successfully.';
          this.populateForm(saved);
          this.isLoading = false;
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (error) => {
          console.error('Failed to update party page settings', error);
          this.error = error.message || 'Failed to update settings';
          this.isLoading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/admin/parties']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.settingsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isPackageFieldInvalid(index: number, fieldName: string): boolean {
    const pkg = this.packages.at(index) as FormGroup;
    const field = pkg.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isBulletInvalid(packageIndex: number, bulletIndex: number): boolean {
    const control = this.bulletsAt(packageIndex).at(bulletIndex);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.settingsForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['maxlength']) {
        const max = field.errors['maxlength'].requiredLength;
        return `Cannot exceed ${max} characters`;
      }
    }
    return '';
  }

  private markAllTouched(): void {
    const markGroup = (group: FormGroup) => {
      Object.keys(group.controls).forEach(key => {
        const control = group.get(key);
        if (control instanceof FormGroup) {
          markGroup(control);
        } else if (control instanceof FormArray) {
          control.controls.forEach(c => {
            if (c instanceof FormGroup) {
              markGroup(c);
            } else {
              c.markAsTouched();
            }
          });
        } else {
          control?.markAsTouched();
        }
      });
    };
    markGroup(this.settingsForm);
  }
}
