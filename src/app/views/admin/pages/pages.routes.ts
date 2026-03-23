import { Routes } from '@angular/router';
import { PagesList } from './list/list';
import { PageEditor } from './editor/editor';

export const routes: Routes = [
  {
    path: '',
    component: PagesList
  },
  {
    path: 'create',
    component: PageEditor
  },
  {
    path: ':id/edit',
    component: PageEditor
  }
];
