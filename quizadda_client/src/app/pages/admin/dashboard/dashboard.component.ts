import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    RouterOutlet,
    SidebarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  @ViewChild('sidenav') sidenav!: MatSidenav;

  private readonly breakpoints = inject(BreakpointObserver);
  private readonly router = inject(Router);

  /** True on tablet/phone widths. Drives the sidenav's mode + close-on-nav behavior. */
  isHandset = false;

  constructor() {
    this.breakpoints.observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(map(r => r.matches), takeUntilDestroyed())
      .subscribe(matches => (this.isHandset = matches));

    // Auto-close the drawer on navigation when in mobile mode so the new page is visible.
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        if (this.isHandset && this.sidenav?.opened) {
          this.sidenav.close();
        }
      });
  }
}
