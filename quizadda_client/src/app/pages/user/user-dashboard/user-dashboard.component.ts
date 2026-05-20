import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { UserSidebarComponent } from '../user-sidebar/user-sidebar.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    RouterOutlet,
    UserSidebarComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent {

  @ViewChild('sidenav') sidenav!: MatSidenav;

  private readonly breakpoints = inject(BreakpointObserver);
  private readonly router = inject(Router);

  isHandset = false;

  constructor() {
    this.breakpoints.observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(map(r => r.matches), takeUntilDestroyed())
      .subscribe(matches => (this.isHandset = matches));

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        if (this.isHandset && this.sidenav?.opened) {
          this.sidenav.close();
        }
      });
  }
}
