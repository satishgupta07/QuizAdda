import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.css']
})
export class AddQuestionComponent {

  quizId: number | any;
  quizTitle: string | any;
  question = {
    quiz: {
      quizId: ''
    },
    content: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    answer: ''
  }

  constructor(private _route: ActivatedRoute) {}

  ngOnInit() {
    this.quizId = this._route.snapshot.params['quizId'];
    this.quizTitle = this._route.snapshot.params['title'];
    console.log(this.quizTitle);
    this.question.quiz.quizId = this.quizId
  }

  formSubmit() {

  }

}
