import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagesPageComponent } from './packages';

describe('Packages', () => {
  let component: PackagesPageComponent;
  let fixture: ComponentFixture<PackagesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagesPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PackagesPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
