import { LocationStrategy } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionsService } from 'src/app/services/questions.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.css'],
})
export class StartPageComponent {
  quizId: number | any;
  questions: any;

  constructor(
    private _locationSt: LocationStrategy,
    private _route: ActivatedRoute,
    private _question: QuestionsService
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
      },
      (error) => {
        console.log(error);
        Swal.fire('Error !!', 'Error while loading data', 'error');
      }
    )
  }
}
