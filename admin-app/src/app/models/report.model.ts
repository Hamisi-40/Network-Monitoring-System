export interface NamedCount {
  name?: string;
  status?: string;
  payment_method?: string;
  package_name?: string;
  count: number | string;
}

export interface RevenueByDate {
  date: string;
  revenue: number | string;
}

export interface RevenueReport {
  total_revenue: number | string;
  revenue_by_date: RevenueByDate[];
}

export interface PaymentReport {
  by_status: NamedCount[];
  by_payment_method: NamedCount[];
}

export interface SessionReport {
  active_sessions: number;
  expired_sessions: number;
  by_status: NamedCount[];
  by_package: NamedCount[];
}

export interface RevenueReportResponse { success: boolean; report?: RevenueReport; revenue?: RevenueReport; }
export interface PaymentReportResponse { success: boolean; report?: PaymentReport; payments?: PaymentReport; }
export interface SessionReportResponse { success: boolean; report?: SessionReport; sessions?: SessionReport; }
