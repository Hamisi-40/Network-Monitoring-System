import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { SessionListResponse, SessionResponse, SessionStatus } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_CONFIG.baseUrl}/sessions`;

  getSessions(): Observable<SessionListResponse> { return this.http.get<SessionListResponse>(this.url); }
  getSession(id: number): Observable<SessionResponse> { return this.http.get<SessionResponse>(`${this.url}/${id}`); }

  /**
   * This currently changes PostgreSQL state only. Future MikroTik/router activation
   * should be coordinated by the backend behind this same API contract.
   */
  changeStatus(id: number, status: SessionStatus): Observable<SessionResponse> {
    return this.http.patch<SessionResponse>(`${this.url}/${id}/status`, { status });
  }
}
