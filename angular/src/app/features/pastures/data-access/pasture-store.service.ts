import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../core/http/api-error';
import { PastureApiService } from './pasture-api.service';
import { Pasture } from './pasture.models';

@Injectable({ providedIn: 'root' })
export class PastureStoreService {
  private readonly api = inject(PastureApiService);
  private readonly records = signal<Pasture[]>([]);
  readonly pastures = this.records.asReadonly();
  readonly loading = signal(false);
  readonly error = signal('');

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    // Clear previous user's state before loading; never display stale cross-account records.
    this.records.set([]);
    try {
      this.records.set(await firstValueFrom(this.api.list()));
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'Unable to load pastures.'));
    } finally {
      this.loading.set(false);
    }
  }
  clear(): void {
    this.records.set([]);
    this.error.set('');
  }
}
