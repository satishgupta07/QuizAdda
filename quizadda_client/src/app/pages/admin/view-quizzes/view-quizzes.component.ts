import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { QuizResponse } from 'src/app/models/quiz.interface';
import { QuizService } from 'src/app/services/quiz.service';

@Component({
  selector: 'app-view-quizzes',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './view-quizzes.component.html',
  styleUrls: ['./view-quizzes.component.css']
})
export class ViewQuizzesComponent {

  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);

  quizzes: QuizResponse[] = [];

  ngOnInit(): void {
    this.loadQuizzes();
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
