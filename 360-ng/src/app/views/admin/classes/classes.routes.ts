import { Routes } from '@angular/router';
import { ClassesList } from './list/list';
import { ClassesCreate } from './create/create';
import { ClassesEdit } from './edit/edit';

export const routes: Routes = [
  {
    path: '',
    component: ClassesList
  },
  {
    path: 'create',
    component: ClassesCreate
  },
  {
    path: ':id/edit',
    component: ClassesEdit
  }
];