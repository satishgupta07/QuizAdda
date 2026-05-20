import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { QuizAttemptResponse } from 'src/app/models/quiz.interface';
import { UserResponse } from 'src/app/models/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { QuizService } from 'src/app/services/quiz.service';

/**
 * Read-only profile view + paginated attempt history. The user payload is
 * cached in {@link AuthService} so this reads synchronously; attempts are
 * fetched 20 at a time with an explicit "Load more" button (avoids surprise
 * infinite-scroll behavior and keeps the implementation simple).
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DatePipe, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);

  user: UserResponse | null = null;
  attempts: QuizAttemptResponse[] = [];
  attemptsLoaded = false;
  loadingMore = false;

  /** Tracks pagination state across "Load more" clicks. */
  private currentPage = 0;
  hasMore = false;
  totalElements = 0;

  ngOnInit(): void {
    this.user = inject(AuthService).getCurrentUser();
    this.loadPage(0);
  }

  loadMore(): void {
    if (this.loadingMore || !this.hasMore) return;
    this.loadingMore = true;
    this.loadPage(this.currentPage + 1);
  }

  /** Percentage score, used for the per-attempt visual badge. */
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
          // Append on subsequent pages, replace on the first.
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
