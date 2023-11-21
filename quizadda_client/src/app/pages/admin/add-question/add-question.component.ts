import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionsService } from 'src/app/services/questions.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css'],
})
export class AddQuestionComponent {
  quizId: number | any;
  quizTitle: string | any;
  question = {
    quiz: {
      quizId: '',
    },
    content: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    answer: '',
  };

  constructor(
    private _route: ActivatedRoute,
    private _question: QuestionsService,
    private _snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.quizId = this._route.snapshot.params['quizId'];
    this.quizTitle = this._route.snapshot.params['title'];
    console.log(this.quizTitle);
    this.question.quiz.quizId = this.quizId;
  }

  formSubmit() {
    if (this.question.content.trim() == '' || this.question.content == null) {
      this._snack.open('Title Required !!', '', {
        duration: 3000,
      });
    }

    this._question.addQuestionOfQuiz(this.question).subscribe(
      (data: any) => {
        this.router.navigate(['/admin/quizzes']);
        Swal.fire('Success !!', 'Question added successfully !!', 'success');
      },
      (error) => {
        Swal.fire('Error !!', 'Something went wrong !!', 'error');
      }
    );
  }
}
