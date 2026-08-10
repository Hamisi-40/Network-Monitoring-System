import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { PackageListResponse, PackagePayload, PackageResponse } from '../models/package.model';

@Injectable({ providedIn: 'root' })
export class PackageService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_CONFIG.baseUrl}/packages`;

  getPackages(): Observable<PackageListResponse> { return this.http.get<PackageListResponse>(this.url); }
  createPackage(payload: PackagePayload): Observable<PackageResponse> { return this.http.post<PackageResponse>(this.url, payload); }
  updatePackage(id: number, payload: PackagePayload): Observable<PackageResponse> { return this.http.patch<PackageResponse>(`${this.url}/${id}`, payload); }
  setStatus(id: number, isActive: boolean): Observable<PackageResponse> {
    return this.http.patch<PackageResponse>(`${this.url}/${id}/status`, { is_active: isActive });
  }
  setSchedule(id: number, availableFrom: string | null, availableUntil: string | null): Observable<PackageResponse> {
    return this.http.patch<PackageResponse>(`${this.url}/${id}/schedule`, {
      available_from: availableFrom,
      available_until: availableUntil
    });
  }
}
