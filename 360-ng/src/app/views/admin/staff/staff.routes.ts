import { Routes } from '@angular/router';
import { StaffList } from './list/list';
import { StaffAdd } from './add/add';
import { StaffEdit } from './edit/edit';
import { StaffDetail } from './detail/detail';

export const routes: Routes = [
  {
    path: '',
    component: StaffList
  },
  {
    path: 'add',
    component: StaffAdd
  },
  {
    path: ':id/detail',
    component: StaffDetail
  },
  {
    path: ':id/edit',
    component: StaffEdit
  }
];