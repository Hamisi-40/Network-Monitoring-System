import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonButton,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  cardOutline,
  chevronForwardOutline,
  downloadOutline,
  refreshOutline,
  searchOutline,
  cashOutline
} from 'ionicons/icons';

import { finalize } from 'rxjs';

import {
  Payment,
  PaymentStatus
} from '../../models/payment.model';

import { PaymentService } from '../../services/payment.service';


@Component({
  selector: 'app-payments',
  standalone: true,

  imports: [
    DatePipe,
    RouterLink,
    IonButton,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSpinner
  ],

  templateUrl: './payments.page.html',
  styleUrl: './payments.page.scss',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsPage {

  private readonly service = inject(PaymentService);

  // Ionic confirmation and feedback controls
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);


  // =====================================================
  // NORMAL PAYMENTS
  // =====================================================

  readonly payments = signal<Payment[]>([]);

  readonly loading = signal(true);
  readonly error = signal(false);

  readonly query = signal('');
  readonly status = signal('all');
  readonly method = signal('all');


  // =====================================================
  // CASH PAYMENT REQUESTS
  // =====================================================

  /**
   * Cash requests returned by:
   * GET /api/admin/payments/cash-requests
   */
  readonly cashRequests = signal<any[]>([]);

  readonly cashLoading = signal(false);
  readonly cashError = signal(false);

  /**
   * Used to disable only the request currently being confirmed.
   */
  readonly confirmingReference = signal<string | null>(null);


  // =====================================================
  // PAGE VIEW
  // =====================================================

  /**
   * Controls whether the administrator is looking at
   * all payments or only cash-payment requests.
   */
  readonly activeView = signal<'all' | 'cash'>('all');


  readonly methods = computed(() => [
    ...new Set(
      this.payments()
        .map((payment) => payment.payment_method)
        .filter(Boolean)
    )
  ]);


  readonly filtered = computed(() => {

    const query =
      this.query()
        .toLowerCase()
        .trim();

    return this.payments().filter((payment) => {

      const matchesQuery =
        !query ||
        `${payment.transaction_reference} ${payment.phone_number}`
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        this.status() === 'all' ||
        payment.status === this.status();

      const matchesMethod =
        this.method() === 'all' ||
        payment.payment_method === this.method();

      return (
        matchesQuery &&
        matchesStatus &&
        matchesMethod
      );
    });
  });


  constructor() {

    addIcons({
      cardOutline,
      chevronForwardOutline,
      downloadOutline,
      refreshOutline,
      searchOutline,
      cashOutline
    });

    // Load normal payment history immediately.
    this.load();
  }


  // =====================================================
  // NORMAL PAYMENTS
  // =====================================================

  load(): void {

    this.loading.set(true);
    this.error.set(false);

    this.service
      .getPayments()
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({

        next: (response) => {
          this.payments.set(
            response.payments ?? []
          );
        },

        error: () => {
          this.error.set(true);
        }
      });
  }


  // =====================================================
  // CASH REQUESTS
  // =====================================================

  /**
   * Change between normal payment history
   * and cash-payment requests.
   */
  changeView(
    view: 'all' | 'cash'
  ): void {

    this.activeView.set(view);

    // Load cash requests only when needed.
    if (
      view === 'cash' &&
      this.cashRequests().length === 0
    ) {
      this.loadCashRequests();
    }
  }


  /**
   * Load cash-payment requests from the backend.
   */
  loadCashRequests(): void {

    this.cashLoading.set(true);
    this.cashError.set(false);

    this.service
      .getCashRequests()
      .pipe(
        finalize(() =>
          this.cashLoading.set(false)
        )
      )
      .subscribe({

        next: (response) => {

          this.cashRequests.set(
            response.cash_requests ?? []
          );
        },

        error: () => {

          this.cashError.set(true);
        }
      });
  }


  /**
   * Ask the administrator to confirm that cash
   * has actually been received before activating access.
   */
  async confirmCash(
    request: any
  ): Promise<void> {

    const alert =
      await this.alertController.create({

        header: 'Confirm Cash Payment',

        message:
          `Confirm that you physically received ` +
          `${this.money(request.amount)} ` +
          `for ${request.package_name}?`,

        buttons: [

          {
            text: 'Cancel',
            role: 'cancel'
          },

          {
            text: 'Confirm Payment',

            handler: () => {
              this.performCashConfirmation(
                request.transaction_reference
              );
            }
          }
        ]
      });

    await alert.present();
  }


  /**
   * Send the actual confirmation request to Express.
   */
  private performCashConfirmation(
    reference: string
  ): void {

    this.confirmingReference.set(reference);

    this.service
      .confirmCashPayment(reference)
      .pipe(
        finalize(() =>
          this.confirmingReference.set(null)
        )
      )
      .subscribe({

        next: async () => {

          const toast =
            await this.toastController.create({

              message:
                'Cash payment confirmed and internet session created.',

              duration: 2500,

              position: 'top',

              color: 'success'
            });

          await toast.present();

          // Refresh both views because the payment and
          // dashboard/session data have now changed.
          this.loadCashRequests();
          this.load();
        },

        error: async () => {

          const toast =
            await this.toastController.create({

              message:
                'Unable to confirm this cash payment.',

              duration: 2500,

              position: 'top',

              color: 'danger'
            });

          await toast.present();
        }
      });
  }


  // =====================================================
  // DISPLAY HELPERS
  // =====================================================

  money(
    value: number | string
  ): string {

    return `TZS ${Number(value).toLocaleString('en-TZ')}`;
  }


  statusLabel(
    status: PaymentStatus
  ): string {

    return status === 'successful'
      ? 'Successful'
      : status[0].toUpperCase() +
          status.slice(1);
  }
}