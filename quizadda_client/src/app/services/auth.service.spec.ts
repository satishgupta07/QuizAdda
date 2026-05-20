import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import baseUrl from './helper';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('persists token + user on successful login', (done) => {
    service.login({ username: 'alice', password: 'pw' }).subscribe(user => {
      expect(user.username).toBe('alice');
      expect(localStorage.getItem('token')).toBe('jwt-123');
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.hasRole('USER')).toBeTrue();
      done();
    });

    const req = http.expectOne(`${baseUrl}/api/v1/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 'jwt-123',
      user: {
        id: 1, username: 'alice', firstName: 'A', lastName: 'L',
        email: 'a@example.com', phone: '', profile: '', enabled: true,
        emailVerified: true, authorities: ['USER']
      }
    });
  });

  it('logout clears localStorage and the current user', () => {
    localStorage.setItem('token', 'jwt');
    localStorage.setItem('user', JSON.stringify({ username: 'x', authorities: ['USER'] }));

    // Re-create the service so it reads the seeded user from localStorage.
    const fresh = TestBed.inject(AuthService);
    fresh.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(fresh.isLoggedIn()).toBeFalse();
  });

  it('hasRole returns false when no user is signed in', () => {
    expect(service.hasRole('ADMIN')).toBeFalse();
    expect(service.hasRole('USER')).toBeFalse();
  });
});
