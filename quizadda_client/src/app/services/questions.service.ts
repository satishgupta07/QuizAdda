import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { QuestionRequest, QuestionResponse } from '../models/question.interface';
import baseUrl from './helper';

/**
 * HTTP client for the `/api/v1/questions` resource.
 * <p>
 * Note the two distinct list endpoints:
 * <ul>
 *   <li>{@link #listByQuiz} — admin view, includes the correct answer</li>
 *   <li>{@link #takeQuiz}   — user view, server strips the answer field</li>
 * </ul>
 */
@Injectable({ providedIn: 'root' })
export class QuestionsService {

  private readonly http = inject(HttpClient);
  private readonly path = `${baseUrl}/api/v1/questions`;

  /** Admin view: includes the correct answer. */
  listByQuiz(quizId: number): Observable<QuestionResponse[]> {
    const params = new HttpParams().set('quizId', quizId);
    return this.http.get<QuestionResponse[]>(this.path, { params });
  }

  /** User view: random subset for taking the quiz; `answer` is stripped server-side. */
  takeQuiz(quizId: number): Observable<QuestionResponse[]> {
    const params = new HttpParams().set('quizId', quizId);
    return this.http.get<QuestionResponse[]>(`${this.path}/take`, { params });
  }

  create(question: QuestionRequest): Observable<QuestionResponse> {
    return this.http.post<QuestionResponse>(this.path, question);
  }

  delete(quesId: number): Observable<void> {
    return this.http.delete<void>(`${this.path}/${quesId}`);
  }
}
