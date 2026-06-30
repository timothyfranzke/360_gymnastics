import { Routes } from '@angular/router';
import { PartyRequestList } from './list/list';
import { PartyRequestDetail } from './detail/detail';
import { PartyImages } from './images/images';
import { PartiesSettings } from './settings/settings';

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
    path: 'settings',
    component: PartiesSettings
  },
  {
    path: ':id',
    component: PartyRequestDetail
  }
];