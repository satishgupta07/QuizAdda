import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Stamps `Authorization: Bearer <token>` on every outgoing request when a token
 * is present. Functional interceptors are the Angular 15+ standard and play
 * cleanly with `provideHttpClient(withInterceptors(...))`.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (!token) {
    return next(req);
  }
  const authedReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  return next(authedReq);
};
