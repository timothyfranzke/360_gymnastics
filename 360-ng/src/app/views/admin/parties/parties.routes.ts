import { Routes } from '@angular/router';
import { PartyRequestList } from './list/list';
import { PartyRequestDetail } from './detail/detail';

export const routes: Routes = [
  {
    path: '',
    component: PartyRequestList
  },
  {
    path: ':id',
    component: PartyRequestDetail
  }
];