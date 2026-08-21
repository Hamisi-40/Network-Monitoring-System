import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { PaymentListResponse, PaymentResponse } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_CONFIG.baseUrl}/payments`;

  getPayments(): Observable<PaymentListResponse> { return this.http.get<PaymentListResponse>(this.url); }
  getPayment(id: number): Observable<PaymentResponse> { return this.http.get<PaymentResponse>(`${this.url}/${id}`); }

  /**
   * Load cash-payment requests for the administrator.
   */
  getCashRequests(): Observable<any> {
    return this.http.get<any>(
      `${this.url}/cash-requests`
    );
  }

  /**
   * Confirm that cash was physically received.
   * The backend will then mark the payment successful
   * and create the customer's internet session.
   */
  confirmCashPayment(reference: string): Observable<any> {
    return this.http.patch<any>(
      `${this.url}/cash-requests/${encodeURIComponent(reference)}/confirm`,
      {}
    );
  }

  /** Temporary backend helper. Keep this method out of normal production controls. */
  markSuccessfulForDevelopment(reference: string): Observable<PaymentResponse> {
    return this.http.patch<PaymentResponse>(`${this.url}/${encodeURIComponent(reference)}/success`, {});
  }
}
