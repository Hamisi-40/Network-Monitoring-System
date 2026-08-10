import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

/** Protected pages share the same reusable sidebar/toolbar layout. */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),

    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { path: 'packages', loadComponent: () => import('./pages/packages/packages.page').then(m => m.PackagesPage) },
      { path: 'payments', loadComponent: () => import('./pages/payments/payments.page').then(m => m.PaymentsPage) },
      { path: 'payments/:id', loadComponent: () => import('./pages/payment-details/payment-details.page').then(m => m.PaymentDetailsPage) },
      { path: 'sessions', loadComponent: () => import('./pages/sessions/sessions.page').then(m => m.SessionsPage) },
      { path: 'sessions/:id', loadComponent: () => import('./pages/session-details/session-details.page').then(m => m.SessionDetailsPage) },
      { path: 'reports', loadComponent: () => import('./pages/reports/reports.page').then(m => m.ReportsPage) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage) },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
