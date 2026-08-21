export type PaymentStatus = 'pending' | 'successful' | 'failed';

export interface Payment {
  id: number;
  transaction_reference: string;
  phone_number: string;
  payment_method: string;
  amount: number | string;
  status: PaymentStatus;
  created_at: string;
  paid_at: string | null;
  package_id: number;
  package_name: string;
  duration_minutes: number;
  speed: string;
}

export interface PaymentListResponse {
  success: boolean;
  payments: Payment[];
}

export interface PaymentResponse {
  success: boolean;
  payment: Payment;
}
