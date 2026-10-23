import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface MapConfiguration {
  center: [number, number];
  zoom: number;
  maxZoom: number;
  zoomControlPosition: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  tileLayers: { url: string; attribution: string }[];
}
interface AppConfiguration {
  apiBaseUrl: string;
  map: MapConfiguration;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private configuration!: AppConfiguration;

  async load(): Promise<void> {
    const config = await firstValueFrom(this.http.get<AppConfiguration>('/app-config.json'));
    // Same-origin API ensures __Host- cookies and CSRF work without shared-domain credentials.
    if (
      !config.apiBaseUrl.startsWith('/') ||
      config.apiBaseUrl.startsWith('//') ||
      config.apiBaseUrl.includes('..')
    ) {
      throw new Error('apiBaseUrl must be an absolute same-origin path.');
    }
    if (
      !config.map ||
      config.map.center.length !== 2 ||
      !config.map.center.every(Number.isFinite)
    ) {
      throw new Error('Map configuration is invalid.');
    }
    this.configuration = config;
  }

  get apiBaseUrl(): string {
    return this.configuration.apiBaseUrl.replace(/\/$/, '');
  }
  get map(): MapConfiguration {
    return this.configuration.map;
  }
  api(path: string): string {
    return `${this.apiBaseUrl}${path}`;
  }
  isApiUrl(url: string): boolean {
    return url === this.apiBaseUrl || url.startsWith(`${this.apiBaseUrl}/`);
  }
}
