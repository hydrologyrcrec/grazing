import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { AppConfigService } from '../../../core/config/app-config.service';
import { Pasture, PastureCreate } from './pasture.models';

@Injectable({ providedIn: 'root' })
export class PastureApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  list() {
    return this.http
      .get<{ pastures: Pasture[] }>(this.config.api('/pastures'))
      .pipe(map((body) => body.pastures));
  }
  create(payload: PastureCreate) {
    return this.http
      .post<{ pasture: Pasture }>(this.config.api('/pastures'), payload)
      .pipe(map((body) => body.pasture));
  }
  get(id: string) {
    return this.http
      .get<{ pasture: Pasture }>(this.config.api(`/pastures/${encodeURIComponent(id)}`))
      .pipe(map((body) => body.pasture));
  }
  update(id: string, payload: Partial<PastureCreate> & { version: number }) {
    return this.http
      .patch<{ pasture: Pasture }>(this.config.api(`/pastures/${encodeURIComponent(id)}`), payload)
      .pipe(map((body) => body.pasture));
  }
  archive(id: string) {
    return this.http.delete<void>(this.config.api(`/pastures/${encodeURIComponent(id)}`));
  }
}
