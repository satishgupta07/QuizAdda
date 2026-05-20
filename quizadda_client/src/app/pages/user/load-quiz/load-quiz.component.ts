import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { DIFFICULTIES, Difficulty, QuizResponse } from 'src/app/models/quiz.interface';
import { QuizService } from 'src/app/services/quiz.service';

type DifficultyFilter = Difficulty | 'ALL';

/**
 * Shows the active quizzes for the user dashboard. If a `categoryId` is present
 * in the route, the list is filtered to that category; otherwise it shows all
 * active quizzes. Search + difficulty filter run client-side over the result.
 */
@Component({
  selector: 'app-load-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink
  ],
  templateUrl: './load-quiz.component.html',
  styleUrls: ['./load-quiz.component.css']
})
export class LoadQuizComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);

  readonly difficulties = DIFFICULTIES;

  quizzes: QuizResponse[] = [];

  search = '';
  difficultyFilter: DifficultyFilter = 'ALL';

  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(() => { this.search = ''; this.difficultyFilter = 'ALL'; }),
      switchMap(params => {
        const categoryId = params.get('categoryId');
        return categoryId
          ? this.quizService.listActiveByCategory(Number(categoryId))
          : this.quizService.listActive();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({ next: data => (this.quizzes = data) });
  }

  get filteredQuizzes(): QuizResponse[] {
    const needle = this.search.trim().toLowerCase();
    return this.quizzes.filter(q => {
      if (this.difficultyFilter !== 'ALL' && q.difficulty !== this.difficultyFilter) return false;
      if (!needle) return true;
      return (
        q.title.toLowerCase().includes(needle) ||
        (q.description?.toLowerCase().includes(needle) ?? false) ||
        (q.tags?.some(t => t.includes(needle)) ?? false)
      );
    });
  }

  trackByQuizId(_: number, q: QuizResponse): number {
    return q.quizId;
  }
}
