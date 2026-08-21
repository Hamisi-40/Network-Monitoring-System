import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusResponse,
  PaymentSuccessDetails,
} from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly lastSuccessState = signal<PaymentSuccessDetails | null>(this.restoreSuccess());
  readonly lastSuccess = this.lastSuccessState.asReadonly();

  constructor(private readonly http: HttpClient) {}

  /** Price is deliberately omitted; the backend reads the trusted package price. */
  initiatePayment(payload: PaymentInitiationRequest): Observable<PaymentInitiationResponse> {
    return this.http.post<PaymentInitiationResponse>(
      `${API_BASE_URL}/api/public/payments/initiate`,
      payload,
    );
  }

  //Check the current payment status
  getPaymentStatus(reference: string): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(
      `${API_BASE_URL}/api/public/payments/${encodeURIComponent(reference)}/status`,
    );
  }

  rememberSuccess(details: PaymentSuccessDetails): void {
    this.lastSuccessState.set(details);
    sessionStorage.setItem('y4c-payment-success', JSON.stringify(details));
  }

  private restoreSuccess(): PaymentSuccessDetails | null {
    try {
      const stored = sessionStorage.getItem('y4c-payment-success');
      return stored ? (JSON.parse(stored) as PaymentSuccessDetails) : null;
    } catch {
      return null;
    }
  }
  /**
 * Create a cash-payment request.
 *
 * Price is deliberately not sent.
 * The backend reads the trusted price from PostgreSQL.
 */
initiateCashPayment(payload: {
  package_id: number;
  phone_number: string;
}): Observable<any> {

  return this.http.post<any>(
    `${API_BASE_URL}/api/public/payments/cash-request`,
    payload
  );
}

}

