import { Routes } from '@angular/router';
import { UserList } from './list/list';
import { UserAdd } from './add/add';
import { UserEdit } from './edit/edit';
import { UserDetail } from './detail/detail';

export const routes: Routes = [
  {
    path: '',
    component: UserList
  },
  {
    path: 'add',
    component: UserAdd
  },
  {
    path: ':id/detail',
    component: UserDetail
  },
  {
    path: ':id/edit',
    component: UserEdit
  }
];