import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { QuestionsService } from 'src/app/services/questions.service';
import { UploadService } from 'src/app/services/upload.service';

/**
 * Form for adding a question to a specific quiz. The {@code quizId} is read
 * from the route (the user navigated here from the quiz's "Add Question"
 * button), so the form itself only collects content + options + answer
 * (+ optional image).
 */
@Component({
  selector: 'app-add-question',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent {

  private readonly fb = inject(FormBuilder);
  private readonly questionsService = inject(QuestionsService);
  private readonly uploadService = inject(UploadService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(5000)]],
    image: [''],
    option1: ['', [Validators.required]],
    option2: ['', [Validators.required]],
    option3: ['', [Validators.required]],
    option4: ['', [Validators.required]],
    answer: ['', [Validators.required]]
  });

  quizId!: number;
  quizTitle = '';
  submitting = false;
  uploading = false;

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.quizTitle = this.route.snapshot.paramMap.get('title') ?? '';
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading = true;
    this.uploadService.uploadImage(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: url => {
          this.form.patchValue({ image: url });
          this.uploading = false;
        },
        error: err => {
          this.uploading = false;
          this.snack.open(err?.error?.message ?? 'Upload failed', '', { duration: 3000 });
        }
      });
    // Reset the input so picking the same file again still fires the event.
    input.value = '';
  }

  removeImage(): void {
    this.form.patchValue({ image: '' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.questionsService.create({ ...this.form.getRawValue(), quizId: this.quizId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          Swal.fire('Success', 'Question added successfully !!', 'success');
          this.router.navigate(['/admin/quizzes']);
        },
        error: () => {
          this.submitting = false;
        }
      });
  }
}
