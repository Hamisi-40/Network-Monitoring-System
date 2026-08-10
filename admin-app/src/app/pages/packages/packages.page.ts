import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton, IonDatetime, IonIcon, IonInput, IonModal,
  IonSpinner, IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, calendarOutline, closeOutline, createOutline, searchOutline, timeOutline, wifiOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { InternetPackage, PackagePayload } from '../../models/package.model';
import { PackageService } from '../../services/package.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonButton, IonDatetime, IonIcon, IonInput, IonModal, IonSpinner, IonToggle],
  templateUrl: './packages.page.html',
  styleUrl: './packages.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackagesPage {
  private readonly service = inject(PackageService);
  private readonly ui = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly packages = signal<InternetPackage[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal(false);
  readonly search = signal('');
  readonly formOpen = signal(false);
  readonly scheduleOpen = signal(false);
  readonly selected = signal<InternetPackage | null>(null);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return !term ? this.packages() : this.packages().filter(item =>
      `${item.name} ${item.speed}`.toLowerCase().includes(term)
    );
  });

  readonly packageForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    price: [0, [Validators.required, Validators.min(1)]],
    duration_minutes: [60, [Validators.required, Validators.min(1)]],
    speed: ['', [Validators.required]],
    is_active: [true]
  });

  readonly scheduleForm = this.fb.group({
    available_from: ['', Validators.required],
    available_until: ['', Validators.required]
  });

  constructor() {
    addIcons({ addOutline, calendarOutline, closeOutline, createOutline, searchOutline, timeOutline, wifiOutline });
    this.load();
  }

  load(): void {
    this.loading.set(true); this.error.set(false);
    this.service.getPackages().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: response => this.packages.set(response.packages ?? []),
      error: () => this.error.set(true)
    });
  }

  openCreate(): void {
    this.selected.set(null);
    this.packageForm.reset({ name: '', price: 0, duration_minutes: 60, speed: '', is_active: true });
    this.formOpen.set(true);
  }

  openEdit(item: InternetPackage): void {
    this.selected.set(item);
    this.packageForm.reset({
      name: item.name, price: Number(item.price), duration_minutes: item.duration_minutes,
      speed: item.speed, is_active: item.is_active
    });
    this.formOpen.set(true);
  }

  savePackage(): void {
    if (this.packageForm.invalid) { this.packageForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload: PackagePayload = this.packageForm.getRawValue();
    const request = this.selected()
      ? this.service.updatePackage(this.selected()!.id, payload)
      : this.service.createPackage(payload);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: async () => { this.formOpen.set(false); this.load(); await this.ui.toast(this.selected() ? 'Package updated.' : 'Package created.'); },
      error: () => this.ui.toast('Package could not be saved. Please try again.', 'danger')
    });
  }

  async toggleStatus(item: InternetPackage, nextStatus: boolean): Promise<void> {
    const confirmed = await this.ui.confirm(
      nextStatus ? 'Activate package?' : 'Deactivate package?',
      `${item.name} will be ${nextStatus ? 'available' : 'hidden'} in the customer portal.`,
      nextStatus ? 'Activate' : 'Deactivate'
    );
    if (!confirmed) return;
    this.service.setStatus(item.id, nextStatus).subscribe({
      next: async () => { this.packages.update(list => list.map(p => p.id === item.id ? { ...p, is_active: nextStatus } : p)); await this.ui.toast(`Package ${nextStatus ? 'activated' : 'deactivated'}.`); },
      error: () => this.ui.toast('Status could not be changed.', 'danger')
    });
  }

  openSchedule(item: InternetPackage): void {
    this.selected.set(item);
    this.scheduleForm.reset({ available_from: item.available_from ?? '', available_until: item.available_until ?? '' });
    this.scheduleOpen.set(true);
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) { this.scheduleForm.markAllAsTouched(); return; }
    const from = this.scheduleForm.value.available_from!;
    const until = this.scheduleForm.value.available_until!;
    if (new Date(until) <= new Date(from)) { void this.ui.toast('End time must be later than the start time.', 'warning'); return; }
    this.updateSchedule(from, until, 'Availability schedule saved.');
  }

  removeSchedule(): void { this.updateSchedule(null, null, 'Availability schedule removed.'); }

  private updateSchedule(from: string | null, until: string | null, message: string): void {
    const item = this.selected(); if (!item) return;
    this.saving.set(true);
    this.service.setSchedule(item.id, from, until).pipe(finalize(() => this.saving.set(false))).subscribe({
      next: async () => { this.scheduleOpen.set(false); this.load(); await this.ui.toast(message); },
      error: () => this.ui.toast('Schedule could not be updated.', 'danger')
    });
  }

  money(value: number | string): string { return `TZS ${Number(value).toLocaleString('en-TZ')}`; }
  duration(minutes: number): string {
    if (minutes % 10080 === 0) return `${minutes / 10080} week${minutes === 10080 ? '' : 's'}`;
    if (minutes % 1440 === 0) return `${minutes / 1440} day${minutes === 1440 ? '' : 's'}`;
    if (minutes % 60 === 0) return `${minutes / 60} hour${minutes === 60 ? '' : 's'}`;
    return `${minutes} minutes`;
  }
}
