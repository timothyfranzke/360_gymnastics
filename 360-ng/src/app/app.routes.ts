import { Routes } from '@angular/router';
import { Home } from './views/home/home';
import { AdminLogin } from './views/admin/login/login';
import { AdminLayout } from './components/admin/admin-layout/admin-layout';
import { AdminDashboard } from './views/admin/dashboard/dashboard';
import { authGuard, adminGuard, staffGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'contact-us',
        loadChildren: () => import('./views/contact-us/contact-us.routes').then(m => m.contactUsRoutes)
    },
    {
        path: 'classes',
        loadChildren: () => import('./views/classes/classes.routes').then(m => m.classesRoutes)
    },
    {
        path: 'open-gym',
        loadChildren: () => import('./views/open-gym/open-gym.routes').then(m => m.openGymRoutes)
    },
    {
        path: 'camps',
        loadChildren: () => import('./views/camps/camps.routes').then(m => m.campsRoutes)
    },
    {
        path: 'parties',
        loadChildren: () => import('./views/parties/parties.routes').then(m => m.partiesRoutes)
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
            },
            {
                path: 'gallery',
                loadChildren: () => import('./views/admin/gallery/gallery.routes').then(m => m.GALLERY_ROUTES),
                canActivate: [staffGuard]
            },
            {
                path: 'camps',
                loadChildren: () => import('./views/admin/camps/camps.routes').then(m => m.routes),
                canActivate: [staffGuard]
            },
            {
                path: 'classes',
                loadChildren: () => import('./views/admin/classes/classes.routes').then(m => m.routes),
                canActivate: [staffGuard]
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
