import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  try {
    return (
      (await auth.ensureSession()) ||
      router.createUrlTree(['/login'], { queryParams: { next: state.url } })
    );
  } catch {
    return router.createUrlTree(['/service-unavailable']);
  }
};

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  try {
    return (await auth.ensureSession()) ? router.createUrlTree(['/home']) : true;
  } catch {
    return router.createUrlTree(['/service-unavailable']);
  }
};
