import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, interval, startWith, switchMap } from 'rxjs';

import { MAX_PAYMENT_POLLS, PAYMENT_POLL_INTERVAL_MS } from '../../config/api.config';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { PaymentMethodCardComponent } from '../../components/payment-method-card/payment-method-card';
import { StatusCardComponent } from '../../components/status-card/status-card';
import { InternetPackage } from '../../models/package.model';
import {
  PaymentMethodId,
  PaymentMethodOption,
  PaymentStatusResponse,
  PaymentSuccessDetails,
} from '../../models/payment.model';
import { PackageService } from '../../services/package.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    PaymentMethodCardComponent,
    StatusCardComponent,
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class PaymentPageComponent implements OnInit, OnDestroy {
  readonly packageItem = signal<InternetPackage | null>(null);
  readonly loadingPackage = signal(true);
  readonly submitting = signal(false);
  readonly waiting = signal(false);
  readonly failed = signal(false);
  readonly timedOut = signal(false);
  readonly errorMessage = signal('');
  readonly reference = signal('');
  readonly pollCount = signal(0);

  readonly paymentMethods: PaymentMethodOption[] = [
    { id: 'mpesa', name: 'M-Pesa', initials: 'MP', color: '#1f8f3a' },
    { id: 'airtel_money', name: 'Airtel Money', initials: 'AM', color: '#db1f2a' },
    { id: 'mixx_by_yas', name: 'Mixx by Yas', initials: 'MY', color: '#7540a6' },
    { id: 'halopesa', name: 'HaloPesa', initials: 'HP', color: '#ef7d16' },
  ];

  readonly paymentForm = new FormGroup({
    paymentMethod: new FormControl<PaymentMethodId | null>(null, Validators.required),
    phoneNumber: new FormControl('', [
      Validators.required,
      // Accept 06/07 local numbers and their +255 international equivalents.
      Validators.pattern(/^(?:\+?255|0)[67]\d{8}$/),
    ]),
  });

  private pollingSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    readonly packageService: PackageService,
    private readonly paymentService: PaymentService,
    private readonly destroyRef: DestroyRef,
  ) {
    // Explicit cleanup below keeps the polling lifecycle clear for maintainers.
    this.destroyRef.onDestroy(() => this.stopPolling());
  }

  ngOnInit(): void {
    const packageId = Number(this.route.snapshot.paramMap.get('packageId'));
    if (!Number.isInteger(packageId) || packageId <= 0) {
      this.errorMessage.set('The selected package is invalid. Please choose a package again.');
      this.loadingPackage.set(false);
      return;
    }

    this.packageService.getPackageById(packageId).subscribe({
      next: (packageItem) => {
        if (!packageItem) {
          this.errorMessage.set('This package is no longer available. Please choose another package.');
        } else {
          this.packageItem.set(packageItem);
          this.packageService.selectPackage(packageItem);
        }
        this.loadingPackage.set(false);
      },
      error: () => {
        this.errorMessage.set('The package could not be loaded. Please return and try again.');
        this.loadingPackage.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  chooseMethod(method: PaymentMethodOption): void {
    if (!this.waiting()) {
      this.paymentForm.controls.paymentMethod.setValue(method.id);
      this.paymentForm.controls.paymentMethod.markAsTouched();
    }
  }

  sanitizePhoneInput(): void {
    const control = this.paymentForm.controls.phoneNumber;
    const cleaned = (control.value || '').replace(/[\s()-]/g, '');
    if (control.value !== cleaned) control.setValue(cleaned);
  }

  initiatePayment(): void {
    this.sanitizePhoneInput();
    this.paymentForm.markAllAsTouched();
    const packageItem = this.packageItem();

    if (this.paymentForm.invalid || !packageItem || this.submitting() || this.waiting()) return;

    this.submitting.set(true);
    this.failed.set(false);
    this.timedOut.set(false);
    this.errorMessage.set('');

    const paymentMethod = this.paymentForm.controls.paymentMethod.value!;
    const phoneNumber = this.normalizePhone(this.paymentForm.controls.phoneNumber.value!);

    // Only package ID, method and phone are submitted; price remains backend-owned.
    this.paymentService
      .initiatePayment({ package_id: packageItem.id, payment_method: paymentMethod, phone_number: phoneNumber })
      .subscribe({
        next: (response) => {

          //Our Express API returns the transaction references
          // inside the "payment" object
          const reference = response.payment?.transaction_reference;
          if (!reference) {
            this.submitting.set(false);
            this.errorMessage.set('The payment request did not return a reference. Please try again.');
            return;
          }

          //Dave the payment references for status polling
          this.reference.set(reference);

          this.submitting.set(false);
          this.waiting.set(true);

          //start checking whether payment becomes successful
          this.startPolling(reference);
        },
        error: () => {
          this.submitting.set(false);
          this.errorMessage.set('Payment could not be initiated. Check your connection and try again.');
        },
      });
  }

  retryPayment(): void {
    this.stopPolling();
    this.waiting.set(false);
    this.failed.set(false);
    this.timedOut.set(false);
    this.reference.set('');
    this.pollCount.set(0);
  }

  cancelPayment(): void {
    this.retryPayment();
  }

  selectedMethodName(): string {
    const selectedId = this.paymentForm.controls.paymentMethod.value;
    return this.paymentMethods.find((method) => method.id === selectedId)?.name || '';
  }

  private startPolling(reference: string): void {

    //stop any prevoius polling process
    this.stopPolling();
    this.pollCount.set(0);

    // startWith(0) performs the first check immediately, then every five seconds.
    this.pollingSubscription = interval(PAYMENT_POLL_INTERVAL_MS)
      .pipe(startWith(0),
      
      //Request the latest payment status from experss
      switchMap(() => 
        
        this.paymentService.getPaymentStatus(reference)
      )
    )
      .subscribe({

        next: (response) => {

          //Counts how many checks have been made
          this.pollCount.update((count) => count + 1);

          //Our backend stores the status inside response.payment
          const status = response.payment.status.toLowerCase();

          //Payment successfully confirmed
          if (
            status === 'successful' || 
            status === 'success' || 
            status === 'paid'
          ) {
            this.handleSuccessfulPayment(response);
            return;
          }

          // Payment failed or was cancelled
          if (status === 'failed' || status === 'cancelled') {
            this.failed.set(true);
            this.waiting.set(false);
            this.stopPolling();
            return;
          }

          //Stop polling after the configured maximum attempts
          if (this.pollCount() >= MAX_PAYMENT_POLLS) {
            this.timedOut.set(true);
            this.waiting.set(false);
            this.stopPolling();
          }
        },
        error: () => {


          // A temporary status-check failure does not expose backend details to the customer.
          this.errorMessage.set('We could not confirm the payment status. You can safely retry the check.');
          this.waiting.set(false);
          this.stopPolling();
        },
      });
  }

  private handleSuccessfulPayment(response: PaymentStatusResponse): void {

    //Package selected by the customer
    const packageItem = this.packageItem()!;
// Get nested payment and session data returned by the backend
const payment = response.payment;
const session = response.session;

const details: PaymentSuccessDetails = {

  // Use the transaction reference returned by the backend
  reference:
    payment.transaction_reference ||
    this.reference(),

  // Use the real session package name when available
  packageName:
    session?.package_name ||
    packageItem.name,

  // Prefer the amount stored in the created session/payment
  amount: Number(
    session?.amount_paid ??
    payment.amount ??
    packageItem.price
  ),

  // Payment method used by the customer
  paymentMethod:
    session?.payment_method ||
    payment.payment_method ||
    this.selectedMethodName(),

  // Phone number used for payment
  phoneNumber:
    session?.phone_number ||
    payment.phone_number ||
    this.paymentForm.controls.phoneNumber.value!,

  // Real session start time created by PostgreSQL
  startedAt:
    session?.started_at ||
    new Date().toISOString(),

  // Real session expiry time created by PostgreSQL
  expiresAt:
    session?.expires_at ||
    this.estimatedExpiry(packageItem.duration_minutes),

  // Session ID exists after successful payment
  sessionId:
    session?.id,

  // Current internet session status
  status:
    session?.status ||
    'active',
};

    this.paymentService.rememberSuccess(details);
    this.stopPolling();
    void this.router.navigate(['/payment-success', encodeURIComponent(details.reference)]);
  }

  private stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = undefined;
  }

  private normalizePhone(phone: string): string {
    return phone.startsWith('0') ? `+255${phone.slice(1)}` : phone.startsWith('255') ? `+${phone}` : phone;
  }

  private estimatedExpiry(durationMinutes: number): string {
    return new Date(Date.now() + durationMinutes * 60_000).toISOString();
  }
}
