import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz } from 'src/app/models/quiz.interface';
import { CategoryService } from 'src/app/services/category.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-quiz',
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.css'],
})
export class AddQuizComponent {
  quiz = {
    title: '',
    description: '',
    maxMarks: 0,
    numberOfQuestions: 0,
    category: {
      catId: '',
      title: '',
      description: ''
    },
    active: false
  }

  pageTexts = {
    title: 'Add New Quiz',
    buttonText: 'Add',
    isEditMode: false
  }

  categories = [
    {
      catId: 23,
      title: 'Programming',
    },
  ];

  constructor(
    private _category: CategoryService,
    private _snack: MatSnackBar,
    private _quiz: QuizService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if(params['quizId']) {
        this._quiz.getQuiz(params['quizId']).subscribe(
          (data:any) => {
            this.quiz = data;
            this.pageTexts.title = "Update Quiz";
            this.pageTexts.buttonText = "Update";
            this.pageTexts.isEditMode = true;
          },
          (error) => {
            Swal.fire('Error !!', 'Error while loading data from server', 'error');
          }
        )
      }
    })
    this._category.categories().subscribe(
      (data: any) => {
        // load categories
        this.categories = data;
        // console.log(this.categories);
      },
      (error) => {
        Swal.fire('Error !!', 'Error while loading data from server', 'error');
      }
    );
  }

  formSubmit() {
    if (this.quiz.title.trim() == '' || this.quiz.title == null) {
      this._snack.open('Title Required !!', '', {
        duration: 3000,
      });
    }

    if(!this.pageTexts.isEditMode) {
      this._quiz.addQuiz(this.quiz).subscribe(
        (data: any) => {
          this.router.navigate(['/admin/quizzes']);
          Swal.fire('Success !!', 'Quiz added successfully !!', 'success');
        },
        (error) => {
          Swal.fire('Error !!', 'Something went wrong !!', 'error');
        }
      );
    } else {
      this._quiz.updateQuiz(this.quiz).subscribe(
        (data:any) => {
          this.router.navigate(['/admin/quizzes']);
          Swal.fire('Success !!', 'Quiz updated successfully !!', 'success');
        },
        (error) => {
          Swal.fire('Error !!', 'Something went wrong !!', 'error');
        }
      )
    }
  }
}
