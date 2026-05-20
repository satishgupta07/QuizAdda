import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-quiz',
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.css'],
})
export class AddQuizComponent {
  quizId: number | null = null;

  quiz = {
    title: '',
    description: '',
    maxMarks: '',
    numberOfQuestions: '',
    category: {
      catId: '',
      title: '',
      description: ''
    },
    active: false
  };

  pageTexts = {
    title: 'Add New Quiz',
    buttonText: 'Add',
    isEditMode: false
  };

  categories: any[] = [];

  constructor(
    private _category: CategoryService,
    private _snack: MatSnackBar,
    private _quiz: QuizService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['quizId']) {
        this.quizId = +params['quizId'];
        this._quiz.getQuiz(this.quizId).subscribe(
          (data: any) => {
            this.quiz = data;
            this.pageTexts.title = 'Update Quiz';
            this.pageTexts.buttonText = 'Update';
            this.pageTexts.isEditMode = true;
          },
          () => Swal.fire('Error !!', 'Error while loading data from server', 'error')
        );
      }
    });

    this._category.categories().subscribe(
      (data: any) => this.categories = data,
      () => Swal.fire('Error !!', 'Error while loading data from server', 'error')
    );
  }

  formSubmit() {
    if (this.quiz.title.trim() === '' || this.quiz.title == null) {
      this._snack.open('Title Required !!', '', { duration: 3000 });
      return;
    }

    // The backend's QuizRequest expects a flat categoryId rather than a nested object.
    const payload = {
      title: this.quiz.title,
      description: this.quiz.description,
      maxMarks: String(this.quiz.maxMarks),
      numberOfQuestions: String(this.quiz.numberOfQuestions),
      active: this.quiz.active,
      categoryId: Number(this.quiz.category.catId)
    };

    if (!this.pageTexts.isEditMode) {
      this._quiz.addQuiz(payload).subscribe(
        () => {
          this.router.navigate(['/admin/quizzes']);
          Swal.fire('Success !!', 'Quiz added successfully !!', 'success');
        },
        () => Swal.fire('Error !!', 'Something went wrong !!', 'error')
      );
    } else if (this.quizId != null) {
      this._quiz.updateQuiz(this.quizId, payload).subscribe(
        () => {
          this.router.navigate(['/admin/quizzes']);
          Swal.fire('Success !!', 'Quiz updated successfully !!', 'success');
        },
        () => Swal.fire('Error !!', 'Something went wrong !!', 'error')
      );
    }
  }
}
