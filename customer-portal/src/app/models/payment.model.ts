import { InternetPackage } from './package.model';
import { InternetSession } from './session.model';

export type PaymentMethodId = 'mpesa' | 'airtel_money' | 'mixx_by_yas' | 'halopesa';
export type PaymentStatus = 'pending' | 'successful' | 'failed';

export interface PaymentMethodOption {
  id: PaymentMethodId;
  name: string;
  initials: string;
  color: string;
}

export interface PaymentInitiationRequest {
  package_id: number;
  payment_method: PaymentMethodId;
  phone_number: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  message: string;

  payment: {
    id: number;
    transaction_reference: string;
    status: string;
    amount: string | number;
    phone_number: string;
    payment_method: string;

    package: {
      id: number;
      name: string;
      duration_minutes: number;
    };
  };
}

/**
 * Optional fields make the client tolerant of common Express response shapes.
 * The backend may return session/payment details at the top level or nested.
 */
// Exact structure returned by:
// GET /api/public/payments/:reference/status
export interface PaymentStatusResponse {
  success: boolean;

  // Payment details are nested inside "payment"
  payment: {
    id: number;
    package_id: number;
    transaction_reference: string;
    status: PaymentStatus | string;
    amount: number | string;
    payment_method: PaymentMethodId | string;
    phone_number: string;
    paid_at: string | null;
  };

  // Session is null while payment is pending.
  // After payment succeeds, the backend returns session details here.
  session: InternetSession | null;
}

export interface PaymentSuccessDetails {
  reference: string;
  packageName: string;
  amount: number;
  paymentMethod: string;
  phoneNumber: string;
  startedAt: string;
  expiresAt: string;
  sessionId?: number;
  status: string;
}

