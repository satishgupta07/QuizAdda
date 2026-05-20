import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { LoginRequest, LoginResponse, Role } from '../models/auth.interface';
import { UserResponse } from '../models/user.interface';
import baseUrl from './helper';

const TOKEN_KEY = 'token';
const USER_KEY  = 'user';

/**
 * Owner of authentication state. Components subscribe to {@link currentUser$}
 * to react to login/logout without polling localStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly path = `${baseUrl}/api/v1/auth`;

  /** Source of truth for the currently authenticated user. `null` when logged out. */
  private readonly currentUserSubject = new BehaviorSubject<UserResponse | null>(this.readUserFromStorage());
  readonly currentUser$: Observable<UserResponse | null> = this.currentUserSubject.asObservable();

  /** Convenience stream that emits `true` whenever a user is signed in. */
  readonly isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(map(u => u !== null));

  /**
   * Performs login and persists the session. Returns the authenticated user
   * so callers (e.g. the login page) can route based on role.
   */
  login(credentials: LoginRequest): Observable<UserResponse> {
    return this.http.post<LoginResponse>(`${this.path}/login`, credentials).pipe(
      tap(response => this.persistSession(response.token, response.user)),
      map(response => response.user)
    );
  }

  /** Clears credentials in-memory and in localStorage. */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  /** Synchronous accessor used by the HTTP interceptor (no async work required). */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Synchronous snapshot of the current user — prefer {@link currentUser$} in components. */
  getCurrentUser(): UserResponse | null {
    return this.currentUserSubject.getValue();
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: Role): boolean {
    const user = this.getCurrentUser();
    return !!user && user.authorities.includes(role);
  }

  private persistSession(token: string, user: UserResponse): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private readUserFromStorage(): UserResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      // Corrupt or non-JSON value — treat as logged out and clean up.
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }
}
