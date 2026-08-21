    import { Component, OnInit, signal } from '@angular/core';
    import { ActivatedRoute, Router, RouterLink } from '@angular/router';
    import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

    import { InternetPackage } from '../../models/package.model';
    import { PackageService } from '../../services/package.service';
    import { PaymentService } from '../../services/payment.service';

    @Component({
    selector: 'app-cash-payment',
    standalone: true,

    // RouterLink is used for the back button.
    // ReactiveFormsModule is used for the phone-number field.
    imports: [
        RouterLink,
        ReactiveFormsModule
    ],

    templateUrl: './cash-payment.html',
    styleUrl: './cash-payment.css'
    })
    export class CashPaymentPageComponent implements OnInit {

    // Holds the real package loaded from the backend.
    readonly packageItem = signal<InternetPackage | null>(null);

    // UI state.
    readonly loading = signal(true);
    readonly submitting = signal(false);
    readonly errorMessage = signal('');

    // Customer phone number.
    readonly phoneNumber = new FormControl('', [
        Validators.required,

        // Accepts:
        // 0712345678
        // 0623456789
        // +255712345678
        // 255712345678
        Validators.pattern(/^(?:\+?255|0)[67]\d{8}$/)
    ]);

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,

        // Reuse the same package service used by the existing payment page.
        readonly packageService: PackageService,

        // Cash request will also go through the payment service.
        private readonly paymentService: PaymentService
    ) {}

    ngOnInit(): void {

        // Read package ID from:
        // /cash-payment/:packageId
        const packageId = Number(
        this.route.snapshot.paramMap.get('packageId')
        );

        // Validate the route parameter.
        if (!Number.isInteger(packageId) || packageId <= 0) {
        this.errorMessage.set(
            'The selected package is invalid. Please choose a package again.'
        );

        this.loading.set(false);
        return;
        }

        // Load the real package from the existing PackageService.
        this.packageService
        .getPackageById(packageId)
        .subscribe({

            next: (packageItem) => {

            if (!packageItem) {
                this.errorMessage.set(
                'This package is no longer available.'
                );
            } else {
                this.packageItem.set(packageItem);

                // Keep selected package available across navigation.
                this.packageService.selectPackage(packageItem);
            }

            this.loading.set(false);
            },

            error: () => {
            this.errorMessage.set(
                'The package could not be loaded. Please return and try again.'
            );

            this.loading.set(false);
            }
        });
    }

    /**
     * Removes spaces/brackets if the customer types a formatted number.
     */
    sanitizePhoneInput(): void {
        const current = this.phoneNumber.value || '';

        const cleaned = current.replace(
        /[\s()-]/g,
        ''
        );

        if (cleaned !== current) {
        this.phoneNumber.setValue(cleaned);
        }
    }

    

    /**
     * Creates the cash-payment request.
     */
    requestCashPayment(): void {
         // Temporary debug to confirm the cash button is working
  console.log('CASH REQUEST BUTTON CLICKED');

        this.sanitizePhoneInput();
        this.phoneNumber.markAsTouched();

        const packageItem = this.packageItem();

        // Stop if form/package is invalid.
        if (
        this.phoneNumber.invalid ||
        !packageItem ||
        this.submitting()
        ) {
        return;
        }

        this.submitting.set(true);
        this.errorMessage.set('');

        const phoneNumber =
        this.normalizePhone(this.phoneNumber.value!);

        // Call the cash-payment endpoint.
        this.paymentService
        .initiateCashPayment({
            package_id: packageItem.id,
            phone_number: phoneNumber
        })
        .subscribe({

            next: (response) => {

            this.submitting.set(false);

            // Backend returns the reference inside payment.
            const reference =
                response.payment?.transaction_reference;

            if (!reference) {
                this.errorMessage.set(
                'The cash request did not return a payment reference.'
                );
                return;
            }

            // Move to the cash instructions/status page.
            void this.router.navigate([
                '/cash-payment-status',
                encodeURIComponent(reference)
            ]);
            },

            error: () => {
            this.submitting.set(false);

            this.errorMessage.set(
                'Cash payment request could not be submitted. Please try again.'
            );
            }
        });
    }

    /**
     * Convert Tanzanian local format to international format.
     */
    private normalizePhone(phone: string): string {

        if (phone.startsWith('0')) {
        return `+255${phone.slice(1)}`;
        }

        if (phone.startsWith('255')) {
        return `+${phone}`;
        }

        return phone;
    }
    }