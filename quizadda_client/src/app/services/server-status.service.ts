import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import baseUrl from './helper';

/**
 * Render's free dyno sleeps after ~15 min of inactivity, so the first request
 * after sleep can take 30–60 seconds. {@link bootStatus$} drives the
 * full-screen splash on app startup, and {@link isSlow$} drives a floating
 * banner whenever any in-flight request stalls past 3 seconds.
 */
export type BootStatus = 'pending-fast' | 'pending-slow' | 'ready';

const SLOW_MS = 3000;
const HARD_TIMEOUT_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class ServerStatusService {

  private readonly http = inject(HttpClient);

  private readonly bootStatusSubject = new BehaviorSubject<BootStatus>('pending-fast');
  readonly bootStatus$: Observable<BootStatus> = this.bootStatusSubject.asObservable();

  /** Count of in-flight requests that have been pending past the slow threshold. */
  private readonly slowCountSubject = new BehaviorSubject<number>(0);
  readonly isSlow$: Observable<boolean> = this.slowCountSubject.pipe(map(c => c > 0));

  /**
   * Pings the health endpoint to warm the dyno. Sets {@code pending-slow} after
   * {@link SLOW_MS} if the response hasn't arrived, then transitions to
   * {@code ready} on response (or after a hard timeout — we'd rather let the
   * app load than block forever if /health is broken).
   */
  warmUp(): void {
    const slowTimer = window.setTimeout(() => {
      if (this.bootStatusSubject.value === 'pending-fast') {
        this.bootStatusSubject.next('pending-slow');
      }
    }, SLOW_MS);

    const finalize = () => {
      window.clearTimeout(slowTimer);
      window.clearTimeout(hardTimer);
      this.bootStatusSubject.next('ready');
    };

    const hardTimer = window.setTimeout(finalize, HARD_TIMEOUT_MS);

    this.http.get(`${baseUrl}/api/v1/health`).subscribe({
      next: finalize,
      error: finalize // Network/CORS failure — show the app and let normal flows surface the error.
    });
  }

  /**
   * Call when an HTTP request starts. Returns a function to call when it
   * finishes (success or failure). If the request hasn't completed within
   * 3 seconds, the {@link isSlow$} stream begins emitting true.
   */
  markSlowAfter(ms = SLOW_MS): () => void {
    let bumped = false;
    const timer = window.setTimeout(() => {
      bumped = true;
      this.slowCountSubject.next(this.slowCountSubject.value + 1);
    }, ms);
    return () => {
      window.clearTimeout(timer);
      if (bumped) {
        this.slowCountSubject.next(Math.max(0, this.slowCountSubject.value - 1));
      }
    };
  }
}
