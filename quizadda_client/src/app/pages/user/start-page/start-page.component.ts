import { LocationStrategy, CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { QuestionResponse, QuizAttemptQuestion } from 'src/app/models/question.interface';
import { QuestionsService } from 'src/app/services/questions.service';
import { QuizService } from 'src/app/services/quiz.service';

/** Seconds allotted per question during a live quiz attempt. */
const SECONDS_PER_QUESTION = 60;

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    RouterLink
  ],
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.css']
})
export class StartPageComponent implements OnDestroy {

  private readonly locationStrategy = inject(LocationStrategy);
  private readonly route = inject(ActivatedRoute);
  private readonly questionsService = inject(QuestionsService);
  private readonly quizService = inject(QuizService);
  private readonly destroyRef = inject(DestroyRef);

  quizId!: number;
  questions: QuizAttemptQuestion[] = [];
  totalQuestions = 0;
  marksGot = '0';
  correctAnswers = 0;
  attempted = 0;
  isSubmitted = false;
  timer = 0;

  /** Timer handle, used so we can stop ticking when the component is destroyed. */
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.preventBackButton();
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.loadQuestions(this.quizId);
  }

  ngOnDestroy(): void {
    // Critical: stop the interval when the user navigates away or refreshes.
    // Without this the timer keeps decrementing in the background.
    this.clearTimer();
  }

  submitQuiz(): void {
    Swal.fire({
      title: 'Do you want to submit the quiz?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Submit'
    }).then(result => {
      if (result.isConfirmed) {
        this.evaluateQuiz();
      }
    });
  }

  getFormattedTime(): string {
    const mm = Math.floor(this.timer / 60);
    const ss = this.timer - mm * 60;
    return `${mm} min : ${ss} sec`;
  }

  trackByQuesId(_: number, q: QuestionResponse): number {
    return q.quesId;
  }

  printPage(): void {
    window.print();
  }

  private preventBackButton(): void {
    history.pushState(null, '', location.href);
    this.locationStrategy.onPopState(() => {
      history.pushState(null, '', location.href);
    });
  }

  private loadQuestions(quizId: number): void {
    this.questionsService.takeQuiz(quizId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          // Augment each question with a local-only chosenAnswer field for ngModel binding.
          this.questions = data.map(q => ({ ...q, chosenAnswer: '' }));
          this.totalQuestions = this.questions.length;
          this.timer = this.totalQuestions * SECONDS_PER_QUESTION;
          this.startTimer();
        }
      });
  }

  private startTimer(): void {
    this.clearTimer();
    this.intervalId = setInterval(() => {
      if (this.timer <= 0) {
        this.clearTimer();
        this.evaluateQuiz();
      } else {
        this.timer--;
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private evaluateQuiz(): void {
    this.clearTimer();
    const answers = this.questions.map(q => ({
      quesId: q.quesId,
      chosenAnswer: q.chosenAnswer ?? ''
    }));

    this.quizService.evaluate(this.quizId, { answers })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.isSubmitted = true;
          this.marksGot = result.marksGot.toFixed(2);
          this.correctAnswers = result.correctAnswers;
          this.attempted = result.attempted;
        }
      });
  }
}
