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
import { LeaderboardEntry } from 'src/app/models/quiz.interface';
import { AuthService } from 'src/app/services/auth.service';
import { QuestionsService } from 'src/app/services/questions.service';
import { QuizService } from 'src/app/services/quiz.service';

/** Seconds allotted per question during a live quiz attempt. */
const SECONDS_PER_QUESTION = 60;

/**
 * Live quiz-taking screen. Responsibilities:
 * <ul>
 *   <li>Fetch the question set (server omits the answer for this endpoint)</li>
 *   <li>Track chosen answers locally via {@code [(ngModel)]} on each option</li>
 *   <li>Drive a countdown timer that auto-submits at zero</li>
 *   <li>POST chosen answers to {@code /evaluate} for server-side scoring</li>
 * </ul>
 * Explicitly implements {@link OnDestroy} so the interval is cleared if the
 * user navigates away mid-attempt — without this the timer keeps decrementing
 * and the eventual auto-submit lands on a stale component.
 */
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
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  quizId!: number;
  questions: QuizAttemptQuestion[] = [];
  totalQuestions = 0;
  marksGot = '0';
  correctAnswers = 0;
  attempted = 0;
  isSubmitted = false;
  timer = 0;

  /** Loaded once the quiz is submitted; shown alongside the score. */
  leaderboard: LeaderboardEntry[] = [];
  /** Tracks the current user's row so we can visually highlight it. */
  currentUsername = '';

  /** Timer handle, used so we can stop ticking when the component is destroyed. */
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.preventBackButton();
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.currentUsername = this.auth.getCurrentUser()?.username ?? '';
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

  /**
   * Blocks the browser back button mid-attempt. We push a duplicate history
   * entry on entry and re-push one on every popstate, so the user can't
   * accidentally exit the quiz and lose progress. They can still navigate
   * forward via the in-app router links (e.g. Submit → result screen).
   */
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
          this.loadLeaderboard();
        }
      });
  }

  /**
   * Fetched right after submission so the user immediately sees where they
   * stand. Failures fall through silently — leaderboard is a nice-to-have,
   * not a critical-path UI element.
   */
  private loadLeaderboard(): void {
    this.quizService.leaderboard(this.quizId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: entries => (this.leaderboard = entries) });
  }

  trackByRank(_: number, entry: LeaderboardEntry): number {
    return entry.rank;
  }
}
