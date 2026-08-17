    import {
    Component,
    DestroyRef,
    OnInit,
    signal
    } from '@angular/core';

    import {
    ActivatedRoute,
    Router,
    RouterLink
    } from '@angular/router';

    import {
    Subscription,
    interval,
    startWith,
    switchMap
    } from 'rxjs';

    import {
    PAYMENT_POLL_INTERVAL_MS,
    MAX_PAYMENT_POLLS
    } from '../../config/api.config';

    import {
    PaymentStatusResponse,
    PaymentSuccessDetails
    } from '../../models/payment.model';

    import { PaymentService } from '../../services/payment.service';


    @Component({
    selector: 'app-cash-payment-status',
    standalone: true,

    // RouterLink is used for navigation back to packages.
    imports: [
        RouterLink
    ],

    templateUrl: './cash-payment-status.html',
    styleUrl: './cash-payment-status.css'
    })
    export class CashPaymentStatusPageComponent implements OnInit {

    // Transaction reference from the URL.
    readonly reference = signal('');

    // Current payment information returned by the backend.
    readonly payment = signal<PaymentStatusResponse['payment'] | null>(null);

    // Session remains null until the administrator confirms payment.
    readonly session = signal<PaymentStatusResponse['session'] | null>(null);

    // UI states.
    readonly loading = signal(true);
    readonly checking = signal(false);
    readonly confirmed = signal(false);
    readonly rejected = signal(false);
    readonly errorMessage = signal('');

    // Number of status checks already performed.
    readonly pollCount = signal(0);

    private pollingSubscription?: Subscription;


    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly paymentService: PaymentService,
        private readonly destroyRef: DestroyRef
    ) {

        // Stop polling when the customer leaves this Angular page.
        this.destroyRef.onDestroy(() => {
        this.stopPolling();
        });
    }


    ngOnInit(): void {

        // Read CASH-xxxx reference from:
        // /cash-payment-status/:reference
        const reference =
        this.route.snapshot.paramMap.get('reference');

        if (!reference) {
        this.errorMessage.set(
            'The cash payment reference is missing.'
        );

        this.loading.set(false);
        return;
        }

        this.reference.set(reference);

        // Start checking the request immediately.
        this.startPolling(reference);
    }


    /**
     * Poll the existing public payment-status API.
     *
     * Cash payment and mobile-money payment ultimately use
     * the same status endpoint.
     */
    private startPolling(reference: string): void {

        this.stopPolling();

        this.pollCount.set(0);
        this.checking.set(true);

        this.pollingSubscription =
        interval(PAYMENT_POLL_INTERVAL_MS)
            .pipe(

            // Perform the first request immediately.
            startWith(0),

            // Request latest payment status from Express.
            switchMap(() =>
                this.paymentService.getPaymentStatus(reference)
            )
            )
            .subscribe({

            next: (response) => {

                this.loading.set(false);

                this.payment.set(response.payment);
                this.session.set(response.session);

                this.pollCount.update(
                (count) => count + 1
                );

                const status =
                response.payment.status.toLowerCase();


                // ==============================================
                // ADMIN CONFIRMED THE CASH PAYMENT
                // ==============================================
                if (
                status === 'successful' ||
                status === 'success' ||
                status === 'paid'
                ) {

                this.confirmed.set(true);
                this.checking.set(false);

                this.handleConfirmedPayment(response);
                return;
                }


                // ==============================================
                // CASH REQUEST WAS REJECTED / FAILED
                // ==============================================
                if (
                status === 'failed' ||
                status === 'rejected' ||
                status === 'cancelled'
                ) {

                this.rejected.set(true);
                this.checking.set(false);

                this.stopPolling();
                return;
                }


                // ==============================================
                // STILL WAITING FOR ADMIN CONFIRMATION
                // ==============================================
                if (
                status === 'awaiting_cash_confirmation' ||
                status === 'pending'
                ) {

                this.checking.set(true);
                }


                // Stop automatic polling eventually.
                //
                // This does NOT cancel the actual cash request.
                // The backend/database still keeps the request,
                // and the admin can still confirm it later.
                if (
                this.pollCount() >= MAX_PAYMENT_POLLS
                ) {

                this.checking.set(false);
                this.stopPolling();
                }
            },


            error: () => {

                this.loading.set(false);
                this.checking.set(false);

                this.errorMessage.set(
                'We could not check the cash payment status right now. Your request is still saved and can be confirmed by the administrator.'
                );

                this.stopPolling();
            }
            });
    }


    /**
     * Convert the successful cash-payment response into
     * the same structure used by the normal payment-success page.
     */
    private handleConfirmedPayment(
        response: PaymentStatusResponse
    ): void {

        const payment = response.payment;
        const session = response.session;

        // A successfully confirmed cash payment should normally
        // already have an internet session.
        if (!session) {
        this.errorMessage.set(
            'Payment was confirmed, but the internet session is still being prepared.'
        );

        return;
        }

        const details: PaymentSuccessDetails = {

        // Real backend transaction reference.
        reference:
            payment.transaction_reference,

        // Package name returned with the created session.
        packageName:
            session.package_name ||
            'Internet Package',

        // Amount paid in cash.
        amount:
            Number(
            session.amount_paid ??
            payment.amount ??
            0
            ),

        // This should normally display "cash".
        paymentMethod:
            session.payment_method ||
            payment.payment_method ||
            'cash',

        // Customer identification number.
        phoneNumber:
            session.phone_number ||
            payment.phone_number ||
            'Not provided',

        // Real session timing from PostgreSQL.
        startedAt:
            session.started_at,

        expiresAt:
            session.expires_at,

        // Session created after admin confirmation.
        sessionId:
            session.id,

        status:
            session.status || 'active'
        };


        // Reuse the existing success-state storage.
        this.paymentService.rememberSuccess(details);

        this.stopPolling();

        // Send the customer to the same success page used by
        // mobile-money payments.
        void this.router.navigate([
        '/payment-success',
        encodeURIComponent(details.reference)
        ]);
    }


    /**
     * Allow the customer to manually check again.
     */
    checkAgain(): void {

        const reference = this.reference();

        if (!reference) {
        return;
        }

        this.errorMessage.set('');
        this.rejected.set(false);

        this.startPolling(reference);
    }


    /**
     * Stop the RxJS polling subscription.
     */
    private stopPolling(): void {

        this.pollingSubscription?.unsubscribe();
        this.pollingSubscription = undefined;
    }
    }