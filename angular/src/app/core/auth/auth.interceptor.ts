import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AppConfigService } from '../config/app-config.service';
import { AuthService } from './auth.service';
import { CsrfService } from './csrf.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(AppConfigService);
  if (!config.isApiUrl(request.url)) return next(request);
  const auth = inject(AuthService);
  const csrf = inject(CsrfService);
  const router = inject(Router);
  const unsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const prepared = unsafe ? from(csrf.ensure()) : from(Promise.resolve(''));
  return prepared.pipe(
    switchMap((token) => {
      const authorized = request.clone({
        withCredentials: true,
        ...(unsafe ? { setHeaders: { 'X-CSRF-Token': token } } : {}),
      });
      return next(authorized).pipe(
        catchError((error: unknown) => {
          if (!(error instanceof HttpErrorResponse) || error.status !== 401)
            return throwError(() => error);
          if (!['ACCESS_MISSING', 'ACCESS_EXPIRED'].includes(error.error?.error)) {
            auth.clearSession();
            void router.navigate(['/login']);
            return throwError(() => error);
          }
          return from(auth.refresh()).pipe(
            switchMap((refreshed) => {
              if (!refreshed) {
                void router.navigate(['/login']);
                return throwError(() => error);
              }
              // Exactly one retry. Never retry invalid credentials or recursive auth requests.
              return next(authorized).pipe(
                catchError((retryError: unknown) => {
                  if (retryError instanceof HttpErrorResponse && retryError.status === 401) {
                    auth.clearSession();
                    void router.navigate(['/login']);
                  }
                  return throwError(() => retryError);
                }),
              );
            }),
          );
        }),
      );
    }),
  );
};
