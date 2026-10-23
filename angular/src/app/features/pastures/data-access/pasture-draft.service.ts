import { Injectable, signal } from '@angular/core';
import { BoundarySelection } from './pasture.models';

@Injectable({ providedIn: 'root' })
export class PastureDraftService {
  private readonly selection = signal<BoundarySelection | null>(null);
  readonly boundary = this.selection.asReadonly();
  select(boundary: BoundarySelection): void {
    this.selection.set(boundary);
  }
  clear(): void {
    this.selection.set(null);
  }
}
