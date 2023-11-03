import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent {
  quizId: number | any;
  quiz: any = {
    title: '',
    description: ''
  };

  constructor(private _route: ActivatedRoute, private _quiz: QuizService, private _router:Router) {}

  ngOnInit() {
    this.quizId = this._route.snapshot.params['quizId'];

    this._quiz.getQuiz(this.quizId).subscribe(
      (data: any) => {
        this.quiz = data;
        console.log(this.quiz)
      },
      (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Error while loading data', 'error');
      }
    )
  }

  startQuiz() {
    Swal.fire({
      title: 'Do you want to start the quiz?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Start'
    }).then((result) => {
      if (result.isConfirmed) {
        this._router.navigate(['/quiz/start/'+this.quizId]);
      }
    })
  }
}
