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

/**
 * Admin view of all questions belonging to a quiz, plus CSV bulk import.
 * The correct answer is highlighted in green — intentional on this admin-only
 * screen.
 */
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
  importing = false;

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.quizTitle = this.route.snapshot.paramMap.get('title') ?? '';
    this.loadQuestions();
  }

  onCsvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.importing = true;
    this.questionsService.importCsv(this.quizId, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.importing = false;
          // Compose a friendly summary; up to 5 error rows shown inline so
          // admins don't have to scroll a Swal modal endlessly.
          const errSummary = result.errors.slice(0, 5)
            .map(e => `<li>Row ${e.rowNumber}: ${e.message}</li>`)
            .join('');
          const more = result.errors.length > 5 ? `<li>...and ${result.errors.length - 5} more</li>` : '';
          Swal.fire({
            icon: result.imported > 0 ? 'success' : 'warning',
            title: `Imported ${result.imported} question(s)`,
            html: result.errors.length
              ? `<p>Some rows were skipped:</p><ul style="text-align:left;">${errSummary}${more}</ul>`
              : 'All rows imported successfully.'
          });
          this.loadQuestions();
        },
        error: err => {
          this.importing = false;
          Swal.fire('Import failed', err?.error?.message ?? 'Could not parse the CSV.', 'error');
        }
      });
    input.value = '';
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
