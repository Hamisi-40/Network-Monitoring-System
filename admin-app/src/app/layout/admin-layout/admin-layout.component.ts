import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem,
  IonLabel, IonList, IonMenu, IonMenuButton, IonSplitPane,
  IonTitle, IonToolbar, MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barChartOutline, cardOutline, cubeOutline, gridOutline, logOutOutline,
  personOutline, pulseOutline, radioOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

interface NavItem { label: string; route: string; icon: string; }

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterLink, RouterLinkActive, RouterOutlet, IonAvatar, IonButton, IonButtons,
    IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu,
    IonMenuButton, IonSplitPane, IonTitle, IonToolbar
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly ui = inject(UiService);
  private readonly menu = inject(MenuController);
  private readonly router = inject(Router);

  readonly initials = computed(() => this.auth.admin()?.name?.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'AD');
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid-outline' },
    { label: 'Packages', route: '/packages', icon: 'cube-outline' },
    { label: 'Payments', route: '/payments', icon: 'card-outline' },
    { label: 'Sessions', route: '/sessions', icon: 'pulse-outline' },
    { label: 'Reports', route: '/reports', icon: 'bar-chart-outline' },
    { label: 'Settings', route: '/settings', icon: 'person-outline' }
  ];

  constructor() {
    addIcons({ gridOutline, cubeOutline, cardOutline, pulseOutline, barChartOutline, personOutline, logOutOutline, radioOutline });
    if (this.auth.token) this.auth.loadCurrentAdmin().subscribe({ error: () => undefined });
  }

  async closeMenu(): Promise<void> { await this.menu.close('admin-menu'); }

  async logout(): Promise<void> {
    const confirmed = await this.ui.confirm('Log out?', 'You will need to sign in again to manage the network.', 'Log out');
    if (confirmed) {
      await this.menu.close('admin-menu');
      this.auth.logout(false);
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
