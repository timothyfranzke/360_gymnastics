import { Routes } from '@angular/router';

// Placeholder component - implementation would be a single component managing gym hours
const HoursManagementComponent = () => import('./management/management').then(m => m.HoursManagement);

export const routes: Routes = [
  {
    path: '',
    loadComponent: HoursManagementComponent
  }
];