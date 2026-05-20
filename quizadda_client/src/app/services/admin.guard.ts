import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/** Restricts a route to authenticated users with the `ADMIN` role. */
export const adminGuard: CanActivateFn = () => {
  return guardForRole('ADMIN');
};

function guardForRole(role: 'ADMIN' | 'USER'): boolean {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.hasRole(role)) {
    return true;
  }
  router.navigate(['/login']);
  return false;
}
