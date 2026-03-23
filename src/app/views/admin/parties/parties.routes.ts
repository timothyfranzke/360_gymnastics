import { Routes } from '@angular/router';
import { PartyRequestList } from './list/list';
import { PartyRequestDetail } from './detail/detail';
import { PartyImages } from './images/images';

export const routes: Routes = [
  {
    path: '',
    component: PartyRequestList
  },
  {
    path: 'images',
    component: PartyImages
  },
  {
    path: ':id',
    component: PartyRequestDetail
  }
];