import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

type State = 'verifying' | 'success' | 'error';

/**
 * Lands here from the verification email. POSTs the token to the backend
 * (POST chosen over GET to avoid accidental verification by link prefetchers
 * or scan-on-receive mail clients).
 */
@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent {

  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  state: State = 'verifying';
  errorMessage = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'error';
      this.errorMessage = 'Missing verification token.';
      return;
    }
    this.auth.verifyEmail(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => (this.state = 'success'),
        error: err => {
          this.state = 'error';
          this.errorMessage = err?.error?.message ?? 'Verification link is invalid or expired.';
        }
      });
  }
}
