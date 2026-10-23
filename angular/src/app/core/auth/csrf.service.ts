import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';

@Injectable({ providedIn: 'root' })
export class CsrfService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly config = inject(AppConfigService);
  private pending: Promise<string> | null = null;

  ensure(): Promise<string> {
    const cookie = document.cookie
      .split('; ')
      .find(
        (value) => value.startsWith('grazing_csrf=') || value.startsWith('__Host-grazing_csrf='),
      );
    const token = cookie?.slice(cookie.indexOf('=') + 1);
    if (token) return Promise.resolve(decodeURIComponent(token));
    if (!this.pending) {
      this.pending = firstValueFrom(
        this.http.get<{ token: string }>(this.config.api('/auth/csrf'), { withCredentials: true }),
      )
        .then(({ token }) => {
          return token;
        })
        .finally(() => {
          this.pending = null;
        });
    }
    return this.pending;
  }
}
