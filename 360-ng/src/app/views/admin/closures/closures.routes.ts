import { Routes } from '@angular/router';

// Placeholder components - implementation would follow similar pattern as announcements
const ClosureListComponent = () => import('./list/list').then(m => m.ClosureList);
const ClosureCreateComponent = () => import('./create/create').then(m => m.ClosureCreate);
const ClosureEditComponent = () => import('./edit/edit').then(m => m.ClosureEdit);

export const routes: Routes = [
  {
    path: '',
    loadComponent: ClosureListComponent
  },
  {
    path: 'create',
    loadComponent: ClosureCreateComponent
  },
  {
    path: ':id/edit',
    loadComponent: ClosureEditComponent
  }
];