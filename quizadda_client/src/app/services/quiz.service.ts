import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/page.interface';
import {
  EvaluateQuizRequest,
  EvaluateQuizResponse,
  LeaderboardEntry,
  QuizAttemptResponse,
  QuizRequest,
  QuizResponse
} from '../models/quiz.interface';
import baseUrl from './helper';

/**
 * HTTP client for the `/api/v1/quizzes` resource, including the user-facing
 * {@link #evaluate} endpoint. Server is the authority on scoring — this client
 * only ships the user's chosen answers, never the correct ones.
 */
@Injectable({ providedIn: 'root' })
export class QuizService {

  private readonly http = inject(HttpClient);
  private readonly path = `${baseUrl}/api/v1/quizzes`;

  list(): Observable<QuizResponse[]> {
    return this.http.get<QuizResponse[]>(this.path);
  }

  get(quizId: number): Observable<QuizResponse> {
    return this.http.get<QuizResponse>(`${this.path}/${quizId}`);
  }

  create(quiz: QuizRequest): Observable<QuizResponse> {
    return this.http.post<QuizResponse>(this.path, quiz);
  }

  update(quizId: number, quiz: QuizRequest): Observable<QuizResponse> {
    return this.http.put<QuizResponse>(`${this.path}/${quizId}`, quiz);
  }

  delete(quizId: number): Observable<void> {
    return this.http.delete<void>(`${this.path}/${quizId}`);
  }

  listByCategory(categoryId: number): Observable<QuizResponse[]> {
    const params = new HttpParams().set('categoryId', categoryId);
    return this.http.get<QuizResponse[]>(this.path, { params });
  }

  listActive(): Observable<QuizResponse[]> {
    return this.http.get<QuizResponse[]>(`${this.path}/active`);
  }

  listActiveByCategory(categoryId: number): Observable<QuizResponse[]> {
    const params = new HttpParams().set('categoryId', categoryId);
    return this.http.get<QuizResponse[]>(`${this.path}/active`, { params });
  }

  evaluate(quizId: number, payload: EvaluateQuizRequest): Observable<EvaluateQuizResponse> {
    return this.http.post<EvaluateQuizResponse>(`${this.path}/${quizId}/evaluate`, payload);
  }

  /** Paginated attempt history for the current user (newest first). */
  myAttempts(page = 0, size = 20): Observable<PageResponse<QuizAttemptResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<QuizAttemptResponse>>(`${this.path}/my-attempts`, { params });
  }

  /** Top-10 leaderboard for a quiz. */
  leaderboard(quizId: number): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.path}/${quizId}/leaderboard`);
  }
}
