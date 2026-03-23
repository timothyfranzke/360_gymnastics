import { Routes } from '@angular/router';
import { FaqList } from './list/list';
import { FaqCreate } from './create/create';
import { FaqEdit } from './edit/edit';
import { FaqCategories } from './categories/categories';

export const routes: Routes = [
  {
    path: '',
    component: FaqList
  },
  {
    path: 'create',
    component: FaqCreate
  },
  {
    path: ':id/edit',
    component: FaqEdit
  },
  {
    path: 'categories',
    component: FaqCategories
  }
];
