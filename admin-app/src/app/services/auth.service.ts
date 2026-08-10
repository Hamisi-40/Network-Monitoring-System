import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Admin, AdminResponse, LoginRequest, LoginResponse } from '../models/admin.model';

const TOKEN_KEY = 'isp_admin_token';
const ADMIN_KEY = 'isp_admin_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly adminState = signal<Admin | null>(this.readStoredAdmin());

  readonly admin = this.adminState.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.token && this.adminState()));

  /**
   * sessionStorage keeps the JWT only for the current browser tab/session.
   * It is automatically removed when the session ends and is never copied into API components.
   */
  get token(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_CONFIG.baseUrl}/auth/login`, credentials).pipe(
      tap(({ token, admin }) => this.setSession(token, admin))
    );
  }

  loadCurrentAdmin(): Observable<AdminResponse> {
    return this.http.get<AdminResponse>(`${API_CONFIG.baseUrl}/auth/me`).pipe(
      tap(({ admin }) => {
        this.adminState.set(admin);
        sessionStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
      })
    );
  }

  logout(redirect = true): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_KEY);
    this.adminState.set(null);
    if (redirect) void this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private setSession(token: string, admin: Admin): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    this.adminState.set(admin);
  }

  private readStoredAdmin(): Admin | null {
    const stored = sessionStorage.getItem(ADMIN_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as Admin;
    } catch {
      sessionStorage.removeItem(ADMIN_KEY);
      return null;
    }
  }
}
