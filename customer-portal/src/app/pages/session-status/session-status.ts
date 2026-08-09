import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { StatusCardComponent } from '../../components/status-card/status-card';
import { InternetSession } from '../../models/session.model';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-session-status-page',
  standalone: true,
  imports: [DatePipe, RouterLink, LoadingSpinnerComponent, StatusCardComponent],
  templateUrl: './session-status.html',
  styleUrl: './session-status.css',
})
export class SessionStatusPageComponent implements OnInit {
  readonly session = signal<InternetSession | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly remainingTime = signal('Calculating...');

  private clockSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly sessionService: SessionService,
    private readonly destroyRef: DestroyRef,
  ) {
    this.destroyRef.onDestroy(() => this.clockSubscription?.unsubscribe());
  }

  ngOnInit(): void {
    const sessionId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      this.errorMessage.set('The session number is invalid.');
      this.loading.set(false);
      return;
    }

    this.sessionService.getSession(sessionId).subscribe({
      next: (session) => {
        this.session.set(session);
        this.loading.set(false);
        this.updateRemainingTime();

        // Remaining time is derived from expires_at every second, never persisted.
        this.clockSubscription = interval(1_000).subscribe(() => this.updateRemainingTime());
      },
      error: () => {
        this.errorMessage.set('Session not found or the service is temporarily unavailable.');
        this.loading.set(false);
      },
    });
  }

  private updateRemainingTime(): void {
    const session = this.session();
    if (!session) return;

    const difference = new Date(session.expires_at).getTime() - Date.now();
    const status = session.status.toLowerCase();
    if (difference <= 0 || status === 'expired') {
      this.remainingTime.set('Expired');
      this.clockSubscription?.unsubscribe();
      this.sessionService.rememberExpiredSession({ ...session, status: 'expired' });
      void this.router.navigate(['/expired']);
      return;
    }

    const totalSeconds = Math.floor(difference / 1_000);
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;

    this.remainingTime.set(
      [days ? `${days}d` : '', `${hours}h`, `${minutes}m`, `${seconds}s`].filter(Boolean).join(' '),
    );
  }
}
