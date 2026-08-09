import { Component, input, output } from '@angular/core';

import { PaymentMethodOption } from '../../models/payment.model';

@Component({
  selector: 'app-payment-method-card',
  standalone: true,
  templateUrl: './payment-method-card.html',
  styleUrl: './payment-method-card.css',
})
export class PaymentMethodCardComponent {
  readonly method = input.required<PaymentMethodOption>();
  readonly selected = input(false);
  readonly disabled = input(false);
  readonly methodSelected = output<PaymentMethodOption>();
}

