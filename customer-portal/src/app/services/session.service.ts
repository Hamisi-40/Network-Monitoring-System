import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { InternetSession, SessionApiResponse } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly expiredSessionState = signal<InternetSession | null>(this.restoreExpiredSession());
  readonly expiredSession = this.expiredSessionState.asReadonly();

  constructor(private readonly http: HttpClient) {}

  getSession(id: number): Observable<InternetSession> {
    return this.http
      .get<SessionApiResponse>(`${API_BASE_URL}/api/public/sessions/${id}`)
      .pipe(map((response) => this.extractSession(response)));
  }

  rememberExpiredSession(session: InternetSession): void {
    this.expiredSessionState.set(session);
    sessionStorage.setItem('y4c-expired-session', JSON.stringify(session));
  }

  private extractSession(response: SessionApiResponse): InternetSession {
    if ('session' in response) return response.session;
    if ('data' in response) return response.data;
    return response;
  }

  private restoreExpiredSession(): InternetSession | null {
    try {
      const stored = sessionStorage.getItem('y4c-expired-session');
      return stored ? (JSON.parse(stored) as InternetSession) : null;
    } catch {
      return null;
    }
  }
}
