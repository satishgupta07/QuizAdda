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
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { DIFFICULTIES, Difficulty, QuizResponse } from 'src/app/models/quiz.interface';
import { QuizService } from 'src/app/services/quiz.service';

type DifficultyFilter = Difficulty | 'ALL';

/**
 * Admin list of all quizzes (active + hidden). Cards show category, difficulty,
 * tags, and quick stats. Filters apply client-side over the loaded set.
 */
@Component({
  selector: 'app-view-quizzes',
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
  templateUrl: './view-quizzes.component.html',
  styleUrls: ['./view-quizzes.component.css']
})
export class ViewQuizzesComponent {

  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);

  readonly difficulties = DIFFICULTIES;

  quizzes: QuizResponse[] = [];

  /** Bound to the search input. Matches title, category title, and tags. */
  search = '';
  /** Bound to the difficulty filter chip group. */
  difficultyFilter: DifficultyFilter = 'ALL';

  ngOnInit(): void {
    this.loadQuizzes();
  }

  get filteredQuizzes(): QuizResponse[] {
    const needle = this.search.trim().toLowerCase();
    return this.quizzes.filter(q => {
      if (this.difficultyFilter !== 'ALL' && q.difficulty !== this.difficultyFilter) return false;
      if (!needle) return true;
      return (
        q.title.toLowerCase().includes(needle) ||
        q.category.title.toLowerCase().includes(needle) ||
        (q.tags?.some(t => t.includes(needle)) ?? false)
      );
    });
  }

  deleteQuiz(quizId: number): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure you want to delete this quiz ?',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(result => {
      if (result.isConfirmed) {
        this.quizService.delete(quizId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire('Success', 'Quiz deleted successfully !!', 'success');
              this.loadQuizzes();
            }
          });
      }
    });
  }

  trackByQuizId(_: number, q: QuizResponse): number {
    return q.quizId;
  }

  private loadQuizzes(): void {
    this.quizService.list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: data => (this.quizzes = data) });
  }
}
