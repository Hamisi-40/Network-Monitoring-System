import { Routes } from '@angular/router';

<<<<<<< HEAD
export const routes: Routes = [];
=======

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'packages' },
  {
    path: 'packages',
    loadComponent: () =>
      import('./pages/packages/packages').then((component) => component.PackagesPageComponent),
    title: 'Choose a Package | Y4C WiFi',
  },
  {
    path: 'payment/:packageId',
    loadComponent: () =>
      import('./pages/payment/payment').then((component) => component.PaymentPageComponent),
    title: 'Mobile Payment | Y4C WiFi',
  },
  {
    path: 'payment-success/:reference',
    loadComponent: () =>
      import('./pages/payment-success/payment-success').then(
        (component) => component.PaymentSuccessPageComponent,
      ),
    title: 'Payment Successful | Y4C WiFi',
  },
  {
    path: 'session/:id',
    loadComponent: () =>
      import('./pages/session-status/session-status').then(
        (component) => component.SessionStatusPageComponent,
      ),
    title: 'Session Details | Y4C WiFi',
  },
  {
    path: 'expired',
    loadComponent: () =>
      import('./pages/expired/expired').then((component) => component.ExpiredPageComponent),
    title: 'Package Expired | Y4C WiFi',
  },

  {
  path: 'cash-payment/:packageId',
  loadComponent: () =>
    import('./pages/cash-payment/cash-payment')
      .then((m) => m.CashPaymentPageComponent)
},
  

{
  path: 'cash-payment-status/:reference',
  loadComponent: () =>
    import('./pages/cash-payment-status/cash-payment-status')
      .then((m) => m.CashPaymentStatusPageComponent)
},

  { path: '**', redirectTo: 'packages' },

];
>>>>>>> omary
