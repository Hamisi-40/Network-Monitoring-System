import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from '../services/auth.service';

/**
 * Central JWT handling: every protected admin request receives the Bearer token.
 * A 401 clears stale local state once and returns the administrator to login.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const isAdminApi = request.url.startsWith(API_CONFIG.baseUrl);
  const isLogin = request.url.endsWith('/auth/login');
  const token = auth.token;

  const authenticatedRequest = isAdminApi && !isLogin && token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isAdminApi && !isLogin && auth.token) auth.logout();
      return throwError(() => error);
    })
  );
};
