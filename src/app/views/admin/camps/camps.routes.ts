import { Routes } from '@angular/router';
import { CampsList } from './list/list';
import { CampsCreate } from './create/create';
import { CampsEdit } from './edit/edit';

export const routes: Routes = [
  {
    path: '',
    component: CampsList
  },
  {
    path: 'create',
    component: CampsCreate
  },
  {
    path: ':id/edit',
    component: CampsEdit
  }
];