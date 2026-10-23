import { Injectable, inject, signal } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { CsrfService } from './csrf.service';
import { AuthResponse, AuthUser, LoginRequest, SignupRequest } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Raw client avoids a dependency cycle with the refresh interceptor.
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly config = inject(AppConfigService);
  private readonly csrf = inject(CsrfService);
  private readonly currentUser = signal<AuthUser | null>(null);
  readonly user = this.currentUser.asReadonly();
  private refreshInFlight: Promise<boolean> | null = null;
  private sessionInFlight: Promise<boolean> | null = null;

  async ensureSession(): Promise<boolean> {
    if (this.currentUser()) return true;
    if (!this.sessionInFlight) {
      this.sessionInFlight = this.loadSession().finally(() => {
        this.sessionInFlight = null;
      });
    }
    return this.sessionInFlight;
  }

  private async loadSession(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<AuthResponse>(this.config.api('/auth/session'), { withCredentials: true }),
      );
      this.currentUser.set(response.user);
      return true;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (['ACCESS_MISSING', 'ACCESS_EXPIRED'].includes(error.error?.error))
          return this.refresh();
        this.currentUser.set(null);
        return false;
      }
      throw error;
    }
  }

  async login(payload: LoginRequest): Promise<void> {
    await this.authenticate('/auth/login', payload);
  }
  async signup(payload: SignupRequest): Promise<void> {
    await this.authenticate('/auth/signup', payload);
  }

  private async authenticate(path: string, payload: LoginRequest | SignupRequest): Promise<void> {
    const token = await this.csrf.ensure();
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(this.config.api(path), payload, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': token },
      }),
    );
    this.currentUser.set(response.user);
  }

  refresh(): Promise<boolean> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.refreshAcrossTabs().finally(() => {
        this.refreshInFlight = null;
      });
    }
    return this.refreshInFlight;
  }

  private async refreshAcrossTabs(): Promise<boolean> {
    const rotate = async (): Promise<boolean> => {
      // Another tab may already have refreshed while this tab waited for the lock.
      try {
        const response = await firstValueFrom(
          this.http.get<AuthResponse>(this.config.api('/auth/session'), { withCredentials: true }),
        );
        this.currentUser.set(response.user);
        return true;
      } catch (error) {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401) throw error;
        if (!['ACCESS_MISSING', 'ACCESS_EXPIRED'].includes(error.error?.error)) {
          this.currentUser.set(null);
          return false;
        }
      }
      return this.performRefresh();
    };
    return navigator.locks ? navigator.locks.request('grazing-session-refresh', rotate) : rotate();
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const token = await this.csrf.ensure();
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(
          this.config.api('/auth/refresh'),
          {},
          { withCredentials: true, headers: { 'X-CSRF-Token': token } },
        ),
      );
      this.currentUser.set(response.user);
      return true;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.currentUser.set(null);
        return false;
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    const token = await this.csrf.ensure();
    await firstValueFrom(
      this.http.post(
        this.config.api('/auth/logout'),
        {},
        { withCredentials: true, headers: { 'X-CSRF-Token': token } },
      ),
    );
    this.currentUser.set(null);
  }

  clearSession(): void {
    this.currentUser.set(null);
  }
}
