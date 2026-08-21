import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';

import { API_BASE_URL, USE_PACKAGE_FALLBACK } from '../config/api.config';
import { MOCK_PACKAGES } from '../mocks/package.mock';
import { InternetPackage, PackageAccent, PackageApiResponse } from '../models/package.model';

@Injectable({ providedIn: 'root' })
export class PackageService {
  private readonly selectedPackageState = signal<InternetPackage | null>(this.restoreSelection());
  private readonly accents: PackageAccent[] = ['blue', 'green', 'purple', 'orange'];

  readonly selectedPackage = this.selectedPackageState.asReadonly();
  readonly usingMockData = signal(false);

  constructor(private readonly http: HttpClient) {}

  /** Loads active packages from Express and uses separated demo data only when enabled. */
  getPackages(): Observable<InternetPackage[]> {
    return this.http.get<PackageApiResponse>(`${API_BASE_URL}/api/public/packages`).pipe(
      map((response) => this.extractPackages(response)),
      map((packages) =>
        packages
          .filter((item) => item.is_active !== false)
          .map((item, index) => ({
            ...item,
            price: Number(item.price),
            duration_minutes: Number(item.duration_minutes),
            speed: item.speed || 'Placeholder Mbps',
            accent: item.accent || this.accents[index % this.accents.length],
          })),
      ),
      tap(() => this.usingMockData.set(false)),
      catchError((error: unknown) => {
        if (!USE_PACKAGE_FALLBACK) {
          return throwError(() => error);
        }

        this.usingMockData.set(true);
        return of(MOCK_PACKAGES.map((item) => ({ ...item })));
      }),
    );
  }

  getPackageById(id: number): Observable<InternetPackage | undefined> {
    const selected = this.selectedPackageState();
    if (selected?.id === id) {
      return of(selected);
    }

    return this.getPackages().pipe(map((packages) => packages.find((item) => item.id === id)));
  }

  /** Keeps selection through route changes and a browser refresh during checkout. */
  selectPackage(packageItem: InternetPackage): void {
    this.selectedPackageState.set(packageItem);
    sessionStorage.setItem('y4c-selected-package', JSON.stringify(packageItem));
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} Minutes`;
    if (minutes % 10_080 === 0) {
      const weeks = minutes / 10_080;
      return `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`;
    }
    if (minutes % 1_440 === 0) {
      const days = minutes / 1_440;
      return `${days} ${days === 1 ? 'Day' : 'Days'}`;
    }
    if (minutes % 60 === 0) {
      const hours = minutes / 60;
      return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
    }
    return `${minutes} Minutes`;
  }

  private extractPackages(response: PackageApiResponse): InternetPackage[] {
    if (Array.isArray(response)) return response;
    if ('packages' in response) return response.packages;
    return response.data;
  }

  private restoreSelection(): InternetPackage | null {
    try {
      const stored = sessionStorage.getItem('y4c-selected-package');
      return stored ? (JSON.parse(stored) as InternetPackage) : null;
    } catch {
      return null;
    }
  }
}

