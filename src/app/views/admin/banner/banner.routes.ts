import { Routes } from '@angular/router';
import { BannerManagement } from './management/management';

export const bannerRoutes: Routes = [
  {
    path: '',
    redirectTo: 'management',
    pathMatch: 'full'
  },
  {
    path: 'management',
    component: BannerManagement,
    title: 'Banner Management'
  }
];