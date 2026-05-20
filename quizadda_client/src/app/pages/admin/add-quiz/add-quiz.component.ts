import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { CategoryResponse } from 'src/app/models/category.interface';
import { DIFFICULTIES, Difficulty, QuizRequest, QuizResponse } from 'src/app/models/quiz.interface';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';

/**
 * Dual-purpose form: creates a new quiz when no `quizId` is in the route, and
 * updates the existing quiz otherwise. Tags are managed as a local array
 * outside the FormControl since Material's chip input doesn't naturally bind
 * to a FormControl for editing-while-typing UX.
 */
@Component({
  selector: 'app-add-quiz',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.css']
})
export class AddQuizComponent {

  private readonly fb = inject(FormBuilder);
  private readonly quizService = inject(QuizService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly difficulties = DIFFICULTIES;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(1000)]],
    maxMarks: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
    numberOfQuestions: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    active: [false],
    difficulty: ['MEDIUM' as Difficulty, [Validators.required]],
    categoryId: [0, [Validators.required, Validators.min(1)]]
  });

  categories: CategoryResponse[] = [];
  tags: string[] = [];
  quizId: number | null = null;
  pageTitle = 'Add New Quiz';
  buttonText = 'Add';
  submitting = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('quizId');
    this.quizId = idParam ? Number(idParam) : null;

    this.categoryService.list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: data => (this.categories = data) });

    if (this.quizId !== null) {
      this.pageTitle = 'Update Quiz';
      this.buttonText = 'Update';
      this.quizService.get(this.quizId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: quiz => this.populateForm(quiz) });
    }
  }

  /** Adds a tag from chip input. Normalizes to lowercase to match server. */
  addTag(event: MatChipInputEvent): void {
    const value = (event.value ?? '').trim().toLowerCase();
    if (value && !this.tags.includes(value) && this.tags.length < 10) {
      this.tags = [...this.tags, value];
    }
    event.chipInput?.clear();
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload: QuizRequest = { ...this.form.getRawValue(), tags: this.tags };
    const op$: Observable<QuizResponse> =
      this.quizId !== null
        ? this.quizService.update(this.quizId, payload)
        : this.quizService.create(payload);

    op$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        Swal.fire('Success', `Quiz ${this.quizId !== null ? 'updated' : 'added'} successfully !!`, 'success');
        this.router.navigate(['/admin/quizzes']);
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  trackByCatId(_: number, c: CategoryResponse): number {
    return c.catId;
  }

  private populateForm(quiz: QuizResponse): void {
    this.form.patchValue({
      title: quiz.title,
      description: quiz.description,
      maxMarks: quiz.maxMarks,
      numberOfQuestions: quiz.numberOfQuestions,
      active: quiz.active,
      difficulty: quiz.difficulty ?? 'MEDIUM',
      categoryId: quiz.category.catId
    });
    this.tags = [...(quiz.tags ?? [])];
  }
}
