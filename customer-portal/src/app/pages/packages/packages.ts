import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { PackageCardComponent } from '../../components/package-card/package-card';
import { InternetPackage } from '../../models/package.model';
import { PackageService } from '../../services/package.service';

@Component({
  selector: 'app-packages-page',
  standalone: true,
  imports: [LoadingSpinnerComponent, PackageCardComponent],
  templateUrl: './packages.html',
  styleUrl: './packages.css',
})
export class PackagesPageComponent implements OnInit {
  readonly packages = signal<InternetPackage[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  constructor(
    readonly packageService: PackageService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.packageService.getPackages().subscribe({
      next: (packages) => {
        // Show four initial cards as requested; the API can still manage their content.
        this.packages.set(packages.slice(0, 4));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Packages could not be loaded. Please check your connection and try again.');
        this.loading.set(false);
      },
    });
  }

  choosePackage(packageItem: InternetPackage): void {
    this.packageService.selectPackage(packageItem);
    void this.router.navigate(['/payment', packageItem.id]);
  }
}

