import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { DashboardResponse } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  /** Fetches the single dashboard summary resource from the admin API. */
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${API_CONFIG.baseUrl}/dashboard`);
  }
}
