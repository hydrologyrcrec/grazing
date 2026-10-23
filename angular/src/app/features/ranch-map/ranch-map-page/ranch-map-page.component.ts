import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AddressSearchComponent } from '../address-search/address-search.component';
import { MapCanvasComponent } from '../map-canvas/map-canvas.component';
import { PastureSidebarComponent } from '../pasture-sidebar/pasture-sidebar.component';
import { PastureDetailsComponent } from '../pasture-details/pasture-details.component';
import { GeocodeResult } from '../data-access/geocoding.service';
import { BoundarySelection, Pasture } from '../../pastures/data-access/pasture.models';
import { PastureStoreService } from '../../pastures/data-access/pasture-store.service';
import { PastureDraftService } from '../../pastures/data-access/pasture-draft.service';

@Component({
  selector: 'app-ranch-map-page',
  imports: [
    AddressSearchComponent,
    MapCanvasComponent,
    PastureSidebarComponent,
    PastureDetailsComponent,
  ],
  templateUrl: './ranch-map-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RanchMapPageComponent implements OnInit {
  readonly store = inject(PastureStoreService);
  private readonly draft = inject(PastureDraftService);
  private readonly router = inject(Router);
  readonly drawRequest = signal(0);
  readonly searchTarget = signal<GeocodeResult | null>(null);
  readonly focusPastureId = signal<string | null>(null);
  readonly selectedPasture = signal<Pasture | null>(null);
  readonly showInstruction = signal(true);

  ngOnInit(): void {
    void this.store.load();
  }
  add(): void {
    this.drawRequest.update((value) => value + 1);
    this.selectedPasture.set(null);
  }
  boundarySelected(boundary: BoundarySelection): void {
    this.draft.select(boundary);
    void this.router.navigate(['/form']);
  }
  selectPasture(id: string): void {
    this.focusPastureId.set(id);
    this.selectedPasture.set(this.store.pastures().find((pasture) => pasture.id === id) ?? null);
  }
}
