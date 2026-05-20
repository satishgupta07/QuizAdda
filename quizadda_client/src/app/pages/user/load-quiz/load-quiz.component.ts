import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { QuizResponse } from 'src/app/models/quiz.interface';
import { QuizService } from 'src/app/services/quiz.service';

/**
 * Shows the active quizzes for the user dashboard. If a `categoryId` is present
 * in the route, the list is filtered to that category; otherwise it shows all
 * active quizzes.
 */
@Component({
  selector: 'app-load-quiz',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './load-quiz.component.html',
  styleUrls: ['./load-quiz.component.css']
})
export class LoadQuizComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);

  quizzes: QuizResponse[] = [];

  ngOnInit(): void {
    // React to category-id changes in-place (no need to re-init the component).
    this.route.paramMap.pipe(
      switchMap(params => {
        const categoryId = params.get('categoryId');
        return categoryId
          ? this.quizService.listActiveByCategory(Number(categoryId))
          : this.quizService.listActive();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({ next: data => (this.quizzes = data) });
  }

  trackByQuizId(_: number, q: QuizResponse): number {
    return q.quizId;
  }
}
