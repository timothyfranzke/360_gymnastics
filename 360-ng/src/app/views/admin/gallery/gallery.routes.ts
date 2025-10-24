import { Routes } from '@angular/router';

export const GALLERY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list').then(m => m.GalleryList),
    title: '360 Gym - Gallery Management'
  },
  {
    path: 'create',
    loadComponent: () => import('./create/create').then(m => m.GalleryCreate),
    title: '360 Gym - Upload Gallery Images'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit/edit').then(m => m.GalleryEdit),
    title: '360 Gym - Edit Gallery Image'
  }
];