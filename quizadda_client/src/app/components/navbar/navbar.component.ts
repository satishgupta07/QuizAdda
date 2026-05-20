import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserResponse } from 'src/app/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';

/**
 * Persistent top navigation. Shows different links depending on auth state
 * and the user's role (USER vs ADMIN). Drives the theme toggle and exposes
 * a hamburger drawer below the tablet breakpoint.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);

  user: UserResponse | null = null;
  isDark = this.theme.isDark();
  mobileMenuOpen = false;

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => (this.user = user));

    this.theme.isDark$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isDark => (this.isDark = isDark));
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.closeMobileMenu();
  }
}
