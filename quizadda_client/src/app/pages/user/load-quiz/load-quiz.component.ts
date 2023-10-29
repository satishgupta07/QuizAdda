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
    title: 'Basic Java Quiz',
    description: 'this is the description',
    maxMarks: '50',
    numberOfQuestions: '20',
    category: {
      title: 'Programming',
    },
  }];

  constructor(private _route: ActivatedRoute, private _quiz:QuizService) {}

  ngOnInit() {
    this.categoryId = this._route.snapshot.params['categoryId'];
    console.log(this.categoryId);

    if(!this.categoryId) {
      this._quiz.quizzes().subscribe(
        (data: any) => {
          this.quizzes = data;
          console.log(this.quizzes);
        },
        (error) => {
          console.log(error);
          Swal.fire('Error !!', 'Error while loading data', 'error');
        }
      );
    }
  }
}
