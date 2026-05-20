import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/** Restricts a route to authenticated users with the `USER` role. */
export const userGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.hasRole('USER')) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
