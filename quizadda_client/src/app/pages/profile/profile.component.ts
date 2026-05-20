import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuizAttemptResponse } from 'src/app/models/quiz.interface';
import { UserResponse } from 'src/app/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { QuizService } from 'src/app/services/quiz.service';

/**
 * Profile view + edit + change password + attempt history. Three independent
 * concerns share one route to keep navigation simple; each is its own form
 * group so they save independently.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly quizService = inject(QuizService);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  user: UserResponse | null = null;

  // --- Profile edit ---
  editing = false;
  savingProfile = false;
  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[0-9+\-\s]{0,20}$/)]]
  });

  // --- Password change ---
  changingPassword = false;
  savingPassword = false;
  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(4)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: group => {
      const a = group.get('newPassword')?.value;
      const b = group.get('confirmPassword')?.value;
      return a && b && a !== b ? { mismatch: true } : null;
    }
  });

  // --- Attempt history ---
  attempts: QuizAttemptResponse[] = [];
  attemptsLoaded = false;
  loadingMore = false;
  private currentPage = 0;
  hasMore = false;
  totalElements = 0;

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.profileForm.patchValue(this.user ?? {});
    this.loadPage(0);
  }

  // ----- Profile edit -----

  startEdit(): void {
    this.profileForm.patchValue(this.user ?? {});
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    this.profileForm.patchValue(this.user ?? {});
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.savingProfile = true;
    this.auth.updateProfile(this.profileForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.user = updated;
          this.editing = false;
          this.savingProfile = false;
          this.snack.open('Profile updated', '', { duration: 2500 });
        },
        error: () => {
          this.savingProfile = false;
        }
      });
  }

  // ----- Password change -----

  startPasswordChange(): void {
    this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    this.changingPassword = true;
  }

  cancelPasswordChange(): void {
    this.changingPassword = false;
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.savingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.auth.changePassword({ currentPassword, newPassword })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.changingPassword = false;
          this.savingPassword = false;
          this.snack.open('Password changed', '', { duration: 2500 });
        },
        error: () => {
          this.savingPassword = false;
          this.snack.open('Current password is incorrect', '', { duration: 3000 });
        }
      });
  }

  // ----- Attempts -----

  loadMore(): void {
    if (this.loadingMore || !this.hasMore) return;
    this.loadingMore = true;
    this.loadPage(this.currentPage + 1);
  }

  percentage(a: QuizAttemptResponse): number {
    if (!a.totalQuestions) return 0;
    return Math.round((a.correctAnswers / a.totalQuestions) * 100);
  }

  trackByAttemptId(_: number, a: QuizAttemptResponse): number {
    return a.id;
  }

  private loadPage(page: number): void {
    this.quizService.myAttempts(page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.attempts = page === 0 ? data.content : [...this.attempts, ...data.content];
          this.currentPage = data.page;
          this.hasMore = !data.last;
          this.totalElements = data.totalElements;
          this.attemptsLoaded = true;
          this.loadingMore = false;
        },
        error: () => {
          this.attemptsLoaded = true;
          this.loadingMore = false;
        }
      });
  }
}
