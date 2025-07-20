import { Routes } from '@angular/router';
import { Classes } from './views/classes/classes';
import { Detail } from './views/classes/detail/detail';
import { Home } from './views/home/home';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'classes',
        component: Classes
    },
    {
        path: 'classes/:id',
        component: Detail
    }
];
