import { Routes } from '@angular/router';
import { FaqList } from './list/list';
import { FaqCreate } from './create/create';
import { FaqEdit } from './edit/edit';

export const faqRoutes: Routes = [
  { path: '', component: FaqList },
  { path: 'create', component: FaqCreate },
  { path: 'edit/:id', component: FaqEdit }
];