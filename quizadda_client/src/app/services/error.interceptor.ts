import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiError } from '../models/api-error.interface';
import { AuthService } from './auth.service';

/**
 * Single point of HTTP failure handling.
 * <p>
 * Maps HTTP errors to user-facing toasts/alerts and logs out + redirects on 401.
 * Components don't need to write the same try/catch + Swal boilerplate anymore.
 * Pass the original error through so callers can still react if needed.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // The backend's GlobalExceptionHandler returns a JSON ApiError payload.
      const apiError = error.error as ApiError | undefined;
      const message = apiError?.message ?? defaultMessageFor(error.status);

      if (error.status === 401) {
        // Either the token expired or it never existed — bounce to login.
        auth.logout();
        if (router.url !== '/login') {
          router.navigate(['/login']);
        }
        Swal.fire('Session expired', 'Please log in again', 'warning');
      } else if (error.status === 403) {
        Swal.fire('Forbidden', message, 'error');
      } else if (error.status >= 500) {
        Swal.fire('Server error', message, 'error');
      } else if (error.status === 0) {
        // Network or CORS — usually transient, can be misleading to alert here.
        Swal.fire('Network error', 'Could not reach the server. Please try again.', 'error');
      }
      // Validation (400) and not-found (404) are usually contextual — let the
      // caller decide whether to surface them. Just rethrow.

      return throwError(() => error);
    })
  );
};

function defaultMessageFor(status: number): string {
  if (status >= 500) return 'Something went wrong on the server.';
  if (status === 0) return 'Could not reach the server.';
  return 'Request failed';
}
