import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  private readonly path = `${baseUrl}/api/v1/questions`;

  constructor(private _http: HttpClient) { }

  public getQuestionsOfQuiz(quizId: number) {
    return this._http.get(this.path, { params: { quizId } });
  }

  public addQuestionOfQuiz(question: any) {
    return this._http.post(this.path, question);
  }

  public deleteQuestion(quesId: number) {
    return this._http.delete(`${this.path}/${quesId}`);
  }

  public getQuestionsOfQuizForUser(quizId: number) {
    return this._http.get(`${this.path}/take`, { params: { quizId } });
  }
}
