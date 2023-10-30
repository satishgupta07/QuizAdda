import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-load-quiz',
  templateUrl: './load-quiz.component.html',
  styleUrls: ['./load-quiz.component.css']
})
export class LoadQuizComponent {

  categoryId: number | any;
  quizzes = [{
    quizId: '',
    title: '',
    description: '',
    maxMarks: '',
    numberOfQuestions: '',
    category: {
      title: '',
    },
  }];

  constructor(private _route: ActivatedRoute, private _quiz:QuizService) {}

  ngOnInit() {
    this._route.params.subscribe((params : any) => {
      this.categoryId = params.categoryId;

      if(!this.categoryId) {
        this._quiz.getActivequizzes().subscribe(
          (data: any) => {
            this.quizzes = data;
          },
          (error) => {
            console.log(error);
            Swal.fire('Error !!', 'Error while loading data', 'error');
          }
        );
      } else {
        this._quiz.getActiveQuizByCategory(this.categoryId).subscribe(
          (data: any) => {
            this.quizzes = data;
          },
          (error) => {
            console.log(error);
            Swal.fire('Error !!', 'Error while loading data', 'error');
          }
        );
      }
    })
  }
}
