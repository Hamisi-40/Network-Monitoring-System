import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonButton, IonIcon, IonInput, IonSelect, IonSelectOption, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cardOutline, chevronForwardOutline, downloadOutline, refreshOutline, searchOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { Payment, PaymentStatus } from '../../models/payment.model';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [DatePipe, RouterLink, IonButton, IonIcon, IonInput, IonSelect, IonSelectOption, IonSpinner],
  templateUrl: './payments.page.html',
  styleUrl: './payments.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsPage {
  private readonly service = inject(PaymentService);
  readonly payments = signal<Payment[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly query = signal('');
  readonly status = signal('all');
  readonly method = signal('all');

  readonly methods = computed(() => [...new Set(this.payments().map(p => p.payment_method).filter(Boolean))]);
  readonly filtered = computed(() => {
    const query = this.query().toLowerCase().trim();
    return this.payments().filter(payment => {
      const matchesQuery = !query || `${payment.transaction_reference} ${payment.phone_number}`.toLowerCase().includes(query);
      return matchesQuery && (this.status() === 'all' || payment.status === this.status()) && (this.method() === 'all' || payment.payment_method === this.method());
    });
  });

  constructor() { addIcons({ cardOutline, chevronForwardOutline, downloadOutline, refreshOutline, searchOutline }); this.load(); }

  load(): void {
    this.loading.set(true); this.error.set(false);
    this.service.getPayments().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: response => this.payments.set(response.payments ?? []), error: () => this.error.set(true)
    });
  }

  money(value: number | string): string { return `TZS ${Number(value).toLocaleString('en-TZ')}`; }
  statusLabel(status: PaymentStatus): string { return status === 'successful' ? 'Successful' : status[0].toUpperCase() + status.slice(1); }
}
