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

  /** Temporary backend helper. Keep this method out of normal production controls. */
  markSuccessfulForDevelopment(reference: string): Observable<PaymentResponse> {
    return this.http.patch<PaymentResponse>(`${this.url}/${encodeURIComponent(reference)}/success`, {});
  }
}
