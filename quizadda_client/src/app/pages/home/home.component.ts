import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Landing page. Signed-in visitors are redirected straight to their
 * dashboard; everyone else sees a marketing hero.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  showHero = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn() && this.auth.hasRole('ADMIN')) {
      this.router.navigate(['/admin']);
    } else if (this.auth.isLoggedIn() && this.auth.hasRole('USER')) {
      this.router.navigate(['/user-dashboard']);
    } else {
      this.showHero = true;
    }
  }
}
