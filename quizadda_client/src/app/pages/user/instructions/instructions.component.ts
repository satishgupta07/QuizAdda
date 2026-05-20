import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { QuizResponse } from 'src/app/models/quiz.interface';
import { QuizService } from 'src/app/services/quiz.service';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);

  quizId!: number;
  quiz: QuizResponse | null = null;

  /** Per-question marks displayed in the instructions list, formatted to 2 decimals. */
  get marksPerQuestion(): string {
    if (!this.quiz) return '0';
    const total = Number(this.quiz.maxMarks);
    const count = Number(this.quiz.numberOfQuestions);
    return count === 0 ? '0' : (total / count).toFixed(2);
  }

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.quizService.get(this.quizId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: data => (this.quiz = data) });
  }

  startQuiz(): void {
    Swal.fire({
      title: 'Do you want to start the quiz?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Start'
    }).then(result => {
      if (result.isConfirmed) {
        this.router.navigate(['/quiz/start', this.quizId]);
      }
    });
  }
}
