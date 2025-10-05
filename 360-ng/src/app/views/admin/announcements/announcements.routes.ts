import { Routes } from '@angular/router';
import { AnnouncementList } from './list/list';
import { AnnouncementCreate } from './create/create';
import { AnnouncementEdit } from './edit/edit';

export const routes: Routes = [
  {
    path: '',
    component: AnnouncementList
  },
  {
    path: 'create',
    component: AnnouncementCreate
  },
  {
    path: ':id/edit',
    component: AnnouncementEdit
  }
];