import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { QuizAttemptResponse } from 'src/app/models/quiz.interface';
import { UserResponse } from 'src/app/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { QuizService } from 'src/app/services/quiz.service';

/**
 * Read-only profile view + attempt history. The user payload is cached in
 * {@link AuthService} so this reads synchronously, then fetches the user's
 * most-recent quiz attempts from the backend.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DatePipe, MatCardModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);

  user: UserResponse | null = null;
  attempts: QuizAttemptResponse[] = [];
  attemptsLoaded = false;

  ngOnInit(): void {
    this.user = inject(AuthService).getCurrentUser();

    this.quizService.myAttempts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.attempts = data;
          this.attemptsLoaded = true;
        },
        error: () => {
          this.attemptsLoaded = true;
        }
      });
  }

  /** Percentage score, used for the per-attempt visual badge. */
  percentage(a: QuizAttemptResponse): number {
    if (!a.totalQuestions) return 0;
    return Math.round((a.correctAnswers / a.totalQuestions) * 100);
  }

  trackByAttemptId(_: number, a: QuizAttemptResponse): number {
    return a.id;
  }
}
