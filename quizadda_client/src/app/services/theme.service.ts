import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Owns the active theme (light/dark) and toggles the `dark-mode` class on
 * <body>. Components subscribe to {@link isDark$} to keep their own UI
 * (toggle icons, etc.) in sync.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly document = inject(DOCUMENT);

  private readonly themeSubject = new BehaviorSubject<Theme>(this.detectInitialTheme());
  readonly isDark$: Observable<boolean> = new Observable<boolean>(subscriber => {
    const sub = this.themeSubject.subscribe(theme => subscriber.next(theme === 'dark'));
    return () => sub.unsubscribe();
  });

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  toggle(): void {
    const next: Theme = this.themeSubject.value === 'dark' ? 'light' : 'dark';
    this.themeSubject.next(next);
    this.applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* SSR / private mode — ignore */ }
  }

  isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }

  private applyTheme(theme: Theme): void {
    const body = this.document.body;
    body.classList.toggle('dark-mode', theme === 'dark');
  }

  /**
   * Resolves the initial theme from (1) explicit user choice in localStorage,
   * else (2) the OS preference via `prefers-color-scheme`.
   */
  private detectInitialTheme(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch { /* ignore */ }

    const prefersDark = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
