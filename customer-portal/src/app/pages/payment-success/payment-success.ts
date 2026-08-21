import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { StatusCardComponent } from '../../components/status-card/status-card';
import { PaymentStatusResponse, PaymentSuccessDetails } from '../../models/payment.model';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-success-page',
  standalone: true,
  imports: [DatePipe, RouterLink, LoadingSpinnerComponent, StatusCardComponent],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css',
})
export class PaymentSuccessPageComponent implements OnInit {
  readonly details = signal<PaymentSuccessDetails | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly paymentService: PaymentService,
  ) {}

  ngOnInit(): void {
    const routeReference = decodeURIComponent(this.route.snapshot.paramMap.get('reference') || '');
    const remembered = this.paymentService.lastSuccess();

    if (remembered && (!routeReference || remembered.reference === routeReference)) {
      this.details.set(remembered);
      this.loading.set(false);
      return;
    }

    if (!routeReference) {
      this.errorMessage.set('Payment details are unavailable. Please return to the packages page.');
      this.loading.set(false);
      return;
    }

    // Refresh-safe fallback: request the confirmed transaction using its route reference.
    this.paymentService.getPaymentStatus(routeReference).subscribe({
      next: (response) => {
        const status = response.payment.status.toLowerCase();
        if (!['successful', 'success', 'paid'].includes(status)) {
          this.errorMessage.set('This payment has not been confirmed yet.');
        } else {
          const mapped = this.mapResponse(response);
          this.details.set(mapped);
          this.paymentService.rememberSuccess(mapped);
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Payment details could not be loaded. Please check your connection.');
        this.loading.set(false);
      },
    });
  }

  private mapResponse(response: PaymentStatusResponse): PaymentSuccessDetails {
    // Read the nested payment and session objects returned by the backend
const payment = response.payment;
const session = response.session;

const details: PaymentSuccessDetails = {
  // Real transaction reference from the payment object
  reference:
    payment.transaction_reference,

  // Prefer the package name returned with the session
  packageName:
    session?.package_name ||
    'Internet Package',

  // Use the real amount stored in payment/session data
  amount:
    Number(
      session?.amount_paid ??
      payment.amount ??
      0
    ),

  // Mobile-money method used by the customer
  paymentMethod:
    session?.payment_method ||
    payment.payment_method ||
    'Mobile Money',

  // Phone number used for the payment
  phoneNumber:
    session?.phone_number ||
    payment.phone_number ||
    'Not provided',

  // Real internet-session start time
  startedAt:
    session?.started_at ||
    new Date().toISOString(),

  // Real internet-session expiry time
  expiresAt:
    session?.expires_at ||
    new Date().toISOString(),

  // Session ID returned after successful payment
  sessionId:
    session?.id,

  // Current internet-session status
  status:
    session?.status ||
    'active',
};

  return details;
  }
}

