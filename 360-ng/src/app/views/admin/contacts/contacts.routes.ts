import { Routes } from '@angular/router';

export const CONTACTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./list/list').then(m => m.ContactsListComponent)
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./detail/detail').then(m => m.ContactDetailComponent)
  }
];