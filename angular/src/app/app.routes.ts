import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/signup/signup-page.component').then((m) => m.SignupPageComponent),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ranch-map/ranch-map-page/ranch-map-page.component').then(
        (m) => m.RanchMapPageComponent,
      ),
  },
  {
    path: 'form',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pastures/pasture-form/pasture-form-page.component').then(
        (m) => m.PastureFormPageComponent,
      ),
  },
  { path: 'tools', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'service-unavailable',
    loadComponent: () =>
      import('./shared/pages/service-unavailable.component').then(
        (m) => m.ServiceUnavailableComponent,
      ),
  },
  { path: '**', redirectTo: 'home' },
];
