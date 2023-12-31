import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  constructor(private _http:HttpClient) { }

  public quizzes() {
    return this._http.get(`${baseUrl}/quiz/`)
  }

  // add new quiz
  public addQuiz(quiz: any) {
    return this._http.post(`${baseUrl}/quiz/`, quiz)
  }

  // delete quiz
  public deleteQuiz(quizId: Number) {
    return this._http.delete(`${baseUrl}/quiz/${quizId}`)
  }

  // get quiz by quizId
  public getQuiz(quizId: Number) {
    return this._http.get(`${baseUrl}/quiz/${quizId}`)
  }

  // update quiz
  public updateQuiz(quiz: any) {
    return this._http.put(`${baseUrl}/quiz/`, quiz)
  }

  // get quizzes of category
  public getQuizByCategory(categoryId: Number) {
    return this._http.get(`${baseUrl}/quiz/category/${categoryId}`)
  }

  // get active quizzes
  public getActivequizzes() {
    return this._http.get(`${baseUrl}/quiz/active`)
  }

  // get quizzes of category
  public getActiveQuizByCategory(categoryId: Number) {
    return this._http.get(`${baseUrl}/quiz/active/category/${categoryId}`)
  }

  public evaluateQuiz(questions: any) {
    return this._http.post(`${baseUrl}/quiz/eval-quiz`, questions);
  }

}
