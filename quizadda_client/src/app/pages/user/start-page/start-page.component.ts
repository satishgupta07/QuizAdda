import { LocationStrategy } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionsService } from 'src/app/services/questions.service';
import { QuizService } from 'src/app/services/quiz.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.css'],
})
export class StartPageComponent {
  quizId: number | any;
  questions: any;
  totalQuestions: number | any;

  marksGot: number | any;
  correctAnswers = 0;
  attempted = 0;
  isSubmitted = false;
  timer: any;

  constructor(
    private _locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _question: QuestionsService,
    private _quiz: QuizService
  ) {}

  ngOnInit(): void {
    this.preventBackButton();
    this.quizId = this._route.snapshot.params['quizId'];
    this.loadQuestions(this.quizId);
  }

  preventBackButton() {
    history.pushState(null, '', location.href);
    this._locationSt.onPopState(() => {
      history.pushState(null, '', location.href);
    });
  }

  loadQuestions(quizId: number) {
    this._question.getQuestionsOfQuizForUser(quizId).subscribe(
      (data) => {
        this.questions = data;
        this.totalQuestions = this.questions.length;
        this.timer = this.questions.length * 60;
        this.questions.forEach((ques: any) => {
          ques['chosenAnswer'] = '';
        });
        this.startTimer();
      },
      (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Error while loading data', 'error');
      }
    );
  }

  submitQuiz() {
    Swal.fire({
      title: 'Do you want to submit the quiz?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Submit',
    }).then((result) => {
      if (result.isConfirmed) {
        // calculations
        this.evalQuiz();
      }
    });
  }

  startTimer() {
    let interval = window.setInterval(() => {
      if (this.timer <= 0) {
        this.evalQuiz();
        clearInterval(interval);
      } else {
        this.timer--;
      }
    }, 1000);
  }

  getFormattedTime() {
    let mm = Math.floor(this.timer / 60);
    let ss = this.timer - mm * 60;
    return `${mm} min : ${ss} sec`;
  }

  evalQuiz() {
    this._quiz.evaluateQuiz(this.questions).subscribe(
      (data: any)=> {
        this.isSubmitted = true;
        this.marksGot = parseFloat(data.marksGot).toFixed(2);
        this.correctAnswers = data.correctAnswers;
        this.attempted = data.attempted;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  printPage() {
    window.print();
  }

}
