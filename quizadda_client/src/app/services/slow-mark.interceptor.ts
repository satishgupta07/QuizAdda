import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { ServerStatusService } from './server-status.service';

/**
 * Hooks every outgoing HTTP request into {@link ServerStatusService.markSlowAfter}
 * so the floating "waking up our server" banner appears whenever a request
 * stalls past 3 seconds. The mark is always cleared in {@code finalize}, so
 * the counter stays balanced regardless of success / error / cancellation.
 *
 * The health probe itself is skipped to avoid double-marking it while the
 * BootGate is already handling that case.
 */
export const slowMarkInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/api/v1/health')) {
    return next(req);
  }
  const clear = inject(ServerStatusService).markSlowAfter();
  return next(req).pipe(finalize(clear));
};
