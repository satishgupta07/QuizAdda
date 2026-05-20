import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Lands here from the email reset link. Token comes from the {@code ?token=}
 * query param. On success the user is bounced to /login.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  token = '';
  submitting = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: g => {
      const a = g.get('newPassword')?.value;
      const b = g.get('confirmPassword')?.value;
      return a && b && a !== b ? { mismatch: true } : null;
    }
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  submit(): void {
    if (!this.token) {
      this.errorMessage = 'Missing reset token in the URL.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.errorMessage = '';
    this.auth.resetPassword({ token: this.token, newPassword: this.form.controls.newPassword.value })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/login'], { queryParams: { reset: 'ok' } }),
        error: err => {
          this.submitting = false;
          this.errorMessage = err?.error?.message ?? 'Reset link is invalid or expired.';
        }
      });
  }
}
