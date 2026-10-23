import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';
import { CsrfService } from './csrf.service';
import { authInterceptor } from './auth.interceptor';

describe('authenticated API requests', () => {
  let http: HttpClient;
  let testing: HttpTestingController;
  const auth = { refresh: vi.fn(), clearSession: vi.fn() };
  const router = { navigate: vi.fn() };
  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AppConfigService,
          useValue: { isApiUrl: (url: string) => url.startsWith('/api/') },
        },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: CsrfService, useValue: { ensure: () => Promise.resolve('csrf-test') } },
      ],
    });
    http = TestBed.inject(HttpClient);
    testing = TestBed.inject(HttpTestingController);
  });
  afterEach(() => testing.verify());
  it('adds credentials and CSRF to a mutation', async () => {
    const response = firstValueFrom(http.post('/api/pastures', {}));
    await Promise.resolve();
    const request = testing.expectOne('/api/pastures');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-CSRF-Token')).toBe('csrf-test');
    request.flush({ pasture: {} });
    await response;
  });
  it('refreshes and retries an expired access token once', async () => {
    auth.refresh.mockResolvedValue(true);
    const response = firstValueFrom(http.get('/api/pastures'));
    await Promise.resolve();
    testing
      .expectOne('/api/pastures')
      .flush({ error: 'ACCESS_EXPIRED' }, { status: 401, statusText: 'Unauthorized' });
    await Promise.resolve();
    testing.expectOne('/api/pastures').flush({ pastures: [] });
    await response;
    expect(auth.refresh).toHaveBeenCalledTimes(1);
  });
  it('does not refresh a revoked session', async () => {
    const response = firstValueFrom(http.get('/api/pastures'));
    const rejected = expect(response).rejects.toMatchObject({ status: 401 });
    await Promise.resolve();
    testing
      .expectOne('/api/pastures')
      .flush({ error: 'SESSION_INVALID' }, { status: 401, statusText: 'Unauthorized' });
    await rejected;
    expect(auth.refresh).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
  it('does not send credentials to an unrelated URL', async () => {
    const response = firstValueFrom(http.get('https://unrelated.example.org/data'));
    const request = testing.expectOne('https://unrelated.example.org/data');
    expect(request.request.withCredentials).toBe(false);
    request.flush({});
    await response;
  });
});
