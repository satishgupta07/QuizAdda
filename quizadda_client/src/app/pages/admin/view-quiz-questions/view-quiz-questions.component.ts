import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { QuestionResponse } from 'src/app/models/question.interface';
import { QuestionsService } from 'src/app/services/questions.service';

@Component({
  selector: 'app-view-quiz-questions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatDividerModule, MatIconModule, RouterLink],
  templateUrl: './view-quiz-questions.component.html',
  styleUrls: ['./view-quiz-questions.component.css']
})
export class ViewQuizQuestionsComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly questionsService = inject(QuestionsService);
  private readonly destroyRef = inject(DestroyRef);

  quizId!: number;
  quizTitle = '';
  questions: QuestionResponse[] = [];

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.quizTitle = this.route.snapshot.paramMap.get('title') ?? '';
    this.loadQuestions();
  }

  deleteQuestion(quesId: number): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure you want to delete this question ?',
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then(result => {
      if (result.isConfirmed) {
        this.questionsService.delete(quesId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire('Success', 'Question deleted successfully !!', 'success');
              this.loadQuestions();
            }
          });
      }
    });
  }

  trackByQuesId(_: number, q: QuestionResponse): number {
    return q.quesId;
  }

  private loadQuestions(): void {
    this.questionsService.listByQuiz(this.quizId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: data => (this.questions = data) });
  }
}
