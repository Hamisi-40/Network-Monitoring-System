import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import {
  PaymentReport, PaymentReportResponse, RevenueReport, RevenueReportResponse,
  SessionReport, SessionReportResponse
} from '../models/report.model';

export interface ReportsBundle {
  revenue: RevenueReport;
  payments: PaymentReport;
  sessions: SessionReport;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_CONFIG.baseUrl}/reports`;

  /** Maps the three report endpoints into one view model for the reports page. */
  getReports(): Observable<ReportsBundle> {
    return forkJoin({
      revenueResponse: this.http.get<RevenueReportResponse>(`${this.url}/revenue`),
      paymentResponse: this.http.get<PaymentReportResponse>(`${this.url}/payments`),
      sessionResponse: this.http.get<SessionReportResponse>(`${this.url}/sessions`)
    }).pipe(map(({ revenueResponse, paymentResponse, sessionResponse }) => ({
      revenue: revenueResponse.report ?? revenueResponse.revenue ?? { total_revenue: 0, revenue_by_date: [] },
      payments: paymentResponse.report ?? paymentResponse.payments ?? { by_status: [], by_payment_method: [] },
      sessions: sessionResponse.report ?? sessionResponse.sessions ?? {
        active_sessions: 0, expired_sessions: 0, by_status: [], by_package: []
      }
    })));
  }
}
