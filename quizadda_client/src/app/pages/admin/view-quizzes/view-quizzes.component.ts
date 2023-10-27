import { Component } from '@angular/core';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-quizzes',
  templateUrl: './view-quizzes.component.html',
  styleUrls: ['./view-quizzes.component.css'],
})
export class ViewQuizzesComponent {
  quizzes = [
    {
      quizId: 23,
      title: 'Basic Java Quiz',
      description: 'this is the description',
      maxMarks: '50',
      numberOfQuestions: '20',
      active: '',
      category: {
        title: 'Programming',
      },
    },
  ];

  constructor(private _quiz: QuizService) {}

  ngOnInit(): void {
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

  deleteQuiz(quizId: Number) {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure you want to delete this quiz ?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this._quiz.deleteQuiz(quizId).subscribe(
          (data: any) => {
            this.ngOnInit();
            Swal.fire('Success', 'Quiz deleted successfully !!', 'success');
          },
          (error) => {
            console.log(error);
            Swal.fire('Error !!', 'Error in deleting quiz', 'error');
          }
        );
      }
    });
  }
}
