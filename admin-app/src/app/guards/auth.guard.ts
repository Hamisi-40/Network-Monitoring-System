import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protected routes are never activated without a locally available session token. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.token ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Keeps a signed-in administrator out of the login screen. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.token ? inject(Router).createUrlTree(['/dashboard']) : true;
};
