import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  constructor(private _http: HttpClient) { }

  public getQuestionsOfQuiz(quizId: any) {
    return this._http.get(`${baseUrl}/question/quiz/${quizId}`)
  }

  public addQuestionOfQuiz(question: any) {
    return this._http.post(`${baseUrl}/question/`, question)
  }

  // delete question
  public deleteQuestion(quesId: Number) {
    return this._http.delete(`${baseUrl}/question/${quesId}`)
  }
}
