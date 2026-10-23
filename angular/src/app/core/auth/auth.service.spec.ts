import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { AppConfigService } from '../config/app-config.service';
import { CsrfService } from './csrf.service';
import { AuthService } from './auth.service';

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'test@example.org',
  firstName: null,
  lastName: null,
};

describe('shared session refresh', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppConfigService, useValue: { api: (path: string) => '/api' + path } },
        { provide: CsrfService, useValue: { ensure: () => Promise.resolve('test-csrf') } },
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('shares a single rotation between simultaneous requests', async () => {
    const first = auth.refresh();
    const second = auth.refresh();
    expect(first).toBe(second);
    http
      .expectOne('/api/auth/session')
      .flush({ error: 'ACCESS_EXPIRED' }, { status: 401, statusText: 'Unauthorized' });
    await Promise.resolve();
    await Promise.resolve();
    const refresh = http.expectOne('/api/auth/refresh');
    expect(refresh.request.headers.get('X-CSRF-Token')).toBe('test-csrf');
    refresh.flush({ user });
    expect(await first).toBe(true);
    expect(await second).toBe(true);
    expect(auth.user()).toEqual(user);
  });
  it('uses a session already refreshed by another tab', async () => {
    const result = auth.refresh();
    http.expectOne('/api/auth/session').flush({ user });
    expect(await result).toBe(true);
    http.expectNone('/api/auth/refresh');
  });
});
