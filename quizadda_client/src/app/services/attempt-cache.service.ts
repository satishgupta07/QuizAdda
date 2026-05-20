import { Injectable } from '@angular/core';

/** What we persist between page loads for an in-progress quiz attempt. */
interface CachedAttempt {
  quizId: number;
  answers: Record<number, string>;
  /** ms remaining when the cache was last written. */
  secondsLeft: number;
  /** Epoch ms — used to expire stale caches. */
  savedAt: number;
}

const KEY_PREFIX = 'attempt:';
/** A cached attempt becomes stale after 2 hours — longer than any quiz would last. */
const TTL_MS = 2 * 60 * 60 * 1000;

/**
 * Caches the user's chosen answers + remaining timer between page loads for a
 * quiz that's in progress. Survives accidental refresh, browser crash,
 * navigation away — but expires after a sane TTL so caches don't pile up.
 */
@Injectable({ providedIn: 'root' })
export class AttemptCacheService {

  save(quizId: number, answers: Record<number, string>, secondsLeft: number): void {
    const payload: CachedAttempt = { quizId, answers, secondsLeft, savedAt: Date.now() };
    try {
      localStorage.setItem(this.key(quizId), JSON.stringify(payload));
    } catch {
      // localStorage full or unavailable (private browsing) — silently skip.
    }
  }

  load(quizId: number): CachedAttempt | null {
    try {
      const raw = localStorage.getItem(this.key(quizId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CachedAttempt;
      // Drop anything past the TTL — stale state can confuse the user worse than starting over.
      if (Date.now() - parsed.savedAt > TTL_MS) {
        this.clear(quizId);
        return null;
      }
      return parsed;
    } catch {
      this.clear(quizId);
      return null;
    }
  }

  clear(quizId: number): void {
    try { localStorage.removeItem(this.key(quizId)); } catch { /* ignore */ }
  }

  private key(quizId: number): string {
    return `${KEY_PREFIX}${quizId}`;
  }
}
