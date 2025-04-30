import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Routes publiques
  {
    path: '',
    loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./features/public/event-details/event-details.component').then(m => m.EventDetailsComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/admin/login/login.component').then(m => m.LoginComponent)
  },
  
  // Routes administratives (protégées)
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-board/admin-board.component').then(m => m.AdminBoardComponent)
      },
      {
        path: 'event-form',
        loadComponent: () => import('./features/admin/event-form/event-form.component').then(m => m.EventFormComponent)
      },
      {
        path: 'event-form/:id',
        loadComponent: () => import('./features/admin/event-form/event-form.component').then(m => m.EventFormComponent)
      }
    ]
  },
  
  // Redirection par défaut
  {
    path: '**',
    redirectTo: ''
  }
];
