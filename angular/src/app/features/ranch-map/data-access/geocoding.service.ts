import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '../../../core/config/app-config.service';

export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
  boundingBox?: [number, number, number, number];
}
@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  search(query: string) {
    return this.http.get<GeocodeResult[]>(this.config.api('/geocode'), { params: { q: query } });
  }
}
