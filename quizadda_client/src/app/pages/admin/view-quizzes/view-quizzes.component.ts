import { Component } from '@angular/core';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-quizzes',
  templateUrl: './view-quizzes.component.html',
  styleUrls: ['./view-quizzes.component.css']
})
export class ViewQuizzesComponent {
  quizzes = [{
      quizId: 23,
      title: 'Basic Java Quiz',
      description: 'this is the description',
      maxMarks: '50',
      numberOfQuestions: '20',
      active: '',
      category: {
        title: 'Programming'
      }
    }
  ];

  constructor(private _quiz: QuizService) {}

  ngOnInit(): void {
    this._quiz.quizzes().subscribe((data:any) => {
      this.quizzes = data;
      console.log(this.quizzes);
    },
    (error) => {
      console.log(error);
      Swal.fire('Error !!', 'Error while loading data', 'error');
    })
  }
}
