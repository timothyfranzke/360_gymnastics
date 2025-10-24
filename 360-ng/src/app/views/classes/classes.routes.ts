import { Routes } from '@angular/router';
import { Classes } from './classes';
import { Detail } from './detail/detail';

export const classesRoutes: Routes = [
  {
    path: '',
    component: Classes
  },
  {
    path: ':id',
    component: Detail
  }
];