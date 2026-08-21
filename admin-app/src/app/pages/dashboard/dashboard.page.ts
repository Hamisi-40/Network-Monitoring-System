import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, cardOutline, cashOutline, checkmarkCircleOutline, cubeOutline, refreshOutline, timeOutline, wifiOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { DashboardStats } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

interface StatCard { label: string; value: string; note: string; icon: string; tone: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink, IonButton, IonIcon, IonSpinner],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage {
  private readonly dashboardService = inject(DashboardService);
  readonly auth = inject(AuthService);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly stats = signal<DashboardStats | null>(null);

  readonly cards = computed<StatCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      { label: 'Total packages', value: String(s.total_packages), note: 'Configured offers', icon: 'cube-outline', tone: 'blue' },
      { label: 'Total payments', value: String(s.total_payments), note: 'All transactions', icon: 'card-outline', tone: 'purple' },
      { label: 'Successful', value: String(s.successful_payments), note: 'Confirmed payments', icon: 'checkmark-circle-outline', tone: 'green' },
      { label: 'Pending', value: String(s.pending_payments), note: 'Awaiting confirmation', icon: 'time-outline', tone: 'orange' },
      { label: 'Active sessions', value: String(s.active_sessions), note: 'Customers online', icon: 'wifi-outline', tone: 'cyan' },
      { label: 'Expired sessions', value: String(s.expired_sessions), note: 'Completed access', icon: 'refresh-outline', tone: 'slate' }
    ];
  });

  constructor() {
    addIcons({ arrowForwardOutline, cardOutline, cashOutline, checkmarkCircleOutline, cubeOutline, refreshOutline, timeOutline, wifiOutline });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.dashboardService.getDashboard().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: response => this.stats.set(response.dashboard),
      error: () => this.error.set(true)
    });
  }

  money(value: number | string | undefined): string {
    return `TZS ${Number(value ?? 0).toLocaleString('en-TZ')}`;
  }
}
