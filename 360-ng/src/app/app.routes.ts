import { Routes } from '@angular/router';
import { Classes } from './views/classes/classes';
import { Detail } from './views/classes/detail/detail';
import { Home } from './views/home/home';
import { AdminLogin } from './views/admin/login/login';
import { AdminLayout } from './components/admin/admin-layout/admin-layout';
import { AdminDashboard } from './views/admin/dashboard/dashboard';
import { authGuard, adminGuard, staffGuard } from './guards/auth.guard';
import { OpenGym } from './views/open-gym/open-gym';

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
    },
    {
        path: 'open-gym',
        component: OpenGym
    },
    {
        path: 'admin/login',
        component: AdminLogin
    },
    {
        path: 'admin',
        component: AdminLayout,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: AdminDashboard,
                canActivate: [staffGuard]
            },
            {
                path: 'announcements',
                loadChildren: () => import('./views/admin/announcements/announcements.routes').then(m => m.routes),
                canActivate: [staffGuard]
            },
            {
                path: 'staff',
                loadChildren: () => import('./views/admin/staff/staff.routes').then(m => m.routes),
                canActivate: [adminGuard]
            },
            {
                path: 'hours',
                loadChildren: () => import('./views/admin/hours/hours.routes').then(m => m.routes),
                canActivate: [staffGuard]
            },
            {
                path: 'closures',
                loadChildren: () => import('./views/admin/closures/closures.routes').then(m => m.routes),
                canActivate: [staffGuard]
            },
            {
                path: 'banner',
                loadChildren: () => import('./views/admin/banner/banner.routes').then(m => m.bannerRoutes),
                canActivate: [adminGuard]
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
