export type SessionStatus = 'active' | 'suspended' | 'expired' | 'failed' | 'pending_activation';

export interface InternetSession {
  id: number;
  started_at: string;
  expires_at: string;
  status: SessionStatus;
  created_at: string;
  package_id: number;
  package_name: string;
  duration_minutes: number;
  speed: string;
  payment_id: number;
  transaction_reference: string;
  phone_number: string;
  payment_method: string;
  amount: number | string;
  paid_at: string | null;
}

export interface SessionListResponse {
  success: boolean;
  sessions: InternetSession[];
}

export interface SessionResponse {
  success: boolean;
  message?: string;
  session: InternetSession;
}
