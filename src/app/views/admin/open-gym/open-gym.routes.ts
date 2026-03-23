import { Routes } from '@angular/router';
import { OpenGymList } from './list/list';
import { AgeGroupCreate } from './age-group/create/create';
import { AgeGroupEdit } from './age-group/edit/edit';
import { OpenGymConfigComponent } from './config/config';

export const routes: Routes = [
  {
    path: '',
    component: OpenGymList
  },
  {
    path: 'config',
    component: OpenGymConfigComponent
  },
  {
    path: 'age-groups/create',
    component: AgeGroupCreate
  },
  {
    path: 'age-groups/:id/edit',
    component: AgeGroupEdit
  }
];