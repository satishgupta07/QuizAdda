import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionsService } from 'src/app/services/questions.service';

@Component({
  selector: 'app-view-quiz-questions',
  templateUrl: './view-quiz-questions.component.html',
  styleUrls: ['./view-quiz-questions.component.css'],
})
export class ViewQuizQuestionsComponent {
  quizId: number | any;
  quizTitle: string | any;
  questions = [
    {
      content: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      answer: ''
    },
  ];

  constructor(
    private _route: ActivatedRoute,
    private _question: QuestionsService
  ) {}

  ngOnInit() {
    this.quizId = this._route.snapshot.params['quizId'];
    this.quizTitle = this._route.snapshot.params['title'];
    this._question.getQuestionsOfQuiz(this.quizId).subscribe(
      (data: any) => {
        console.log(data);
        this.questions = data;
      },
      (error) => {
        console.log(error);
      }
    );

    console.log(this.quizId + ' ' + this.quizTitle);
  }
}
