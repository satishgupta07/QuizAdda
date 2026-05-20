import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private readonly path = `${baseUrl}/api/v1/quizzes`;

  constructor(private _http: HttpClient) { }

  public quizzes() {
    return this._http.get(this.path);
  }

  public addQuiz(quiz: any) {
    return this._http.post(this.path, quiz);
  }

  public deleteQuiz(quizId: number) {
    return this._http.delete(`${this.path}/${quizId}`);
  }

  public getQuiz(quizId: number) {
    return this._http.get(`${this.path}/${quizId}`);
  }

  public updateQuiz(quizId: number, quiz: any) {
    return this._http.put(`${this.path}/${quizId}`, quiz);
  }

  public getQuizByCategory(categoryId: number) {
    return this._http.get(this.path, { params: { categoryId } });
  }

  public getActivequizzes() {
    return this._http.get(`${this.path}/active`);
  }

  public getActiveQuizByCategory(categoryId: number) {
    return this._http.get(`${this.path}/active`, { params: { categoryId } });
  }

  // Posts the user's chosen answers for a specific quiz. Server validates and
  // computes the score against its own authoritative answer key.
  public evaluateQuiz(quizId: number, questions: any[]) {
    const payload = {
      answers: questions.map(q => ({
        quesId: q.quesId,
        chosenAnswer: q.chosenAnswer ?? ''
      }))
    };
    return this._http.post(`${this.path}/${quizId}/evaluate`, payload);
  }
}
