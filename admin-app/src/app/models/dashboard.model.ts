export interface DashboardStats {
  total_packages: number;
  total_payments: number;
  successful_payments: number;
  pending_payments: number;
  active_sessions: number;
  expired_sessions: number;
  total_revenue: number | string;
}

export interface DashboardResponse {
  success: boolean;
  dashboard: DashboardStats;
}
