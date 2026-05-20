import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Landing page. Routes the visitor to the appropriate section depending on
 * their current auth state.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isLoggedIn() && this.auth.hasRole('ADMIN')) {
      this.router.navigate(['/admin']);
    } else if (this.auth.isLoggedIn() && this.auth.hasRole('USER')) {
      this.router.navigate(['/user-dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
