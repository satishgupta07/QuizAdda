import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsResponse, QuizStats } from 'src/app/models/analytics.interface';
import { AnalyticsService } from 'src/app/services/analytics.service';

/**
 * Admin analytics dashboard — top-line stat tiles plus a per-quiz roll-up of
 * the top 5 most-attempted quizzes with their average score.
 */
@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent {

  private readonly analyticsService = inject(AnalyticsService);
  private readonly destroyRef = inject(DestroyRef);

  data: AnalyticsResponse | null = null;
  loaded = false;

  ngOnInit(): void {
    this.analyticsService.getAnalytics()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => { this.data = data; this.loaded = true; },
        error: () => { this.loaded = true; }
      });
  }

  trackByQuizId(_: number, q: QuizStats): number {
    return q.quizId;
  }
}
