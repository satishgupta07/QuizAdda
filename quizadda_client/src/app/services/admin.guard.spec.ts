import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';

describe('adminGuard', () => {

  const setup = (loggedIn: boolean, role: 'ADMIN' | 'USER') => {
    const auth = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'hasRole']);
    auth.isLoggedIn.and.returnValue(loggedIn);
    auth.hasRole.and.callFake(r => loggedIn && r === role);

    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router }
      ]
    });
    return { auth, router };
  };

  it('allows admins through', () => {
    setup(true, 'ADMIN');
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('blocks regular users and redirects to login', () => {
    const { router } = setup(true, 'USER');
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('blocks anonymous visitors', () => {
    const { router } = setup(false, 'ADMIN');
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
