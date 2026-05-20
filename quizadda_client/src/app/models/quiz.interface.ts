import { CategoryResponse } from './category.interface';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

/**
 * Quiz returned from the backend. `maxMarks` and `numberOfQuestions` are strings
 * because that's how the backend stores them (free-form values in DB columns).
 */
export interface QuizResponse {
  quizId: number;
  title: string;
  description: string;
  maxMarks: string;
  numberOfQuestions: string;
  active: boolean;
  difficulty: Difficulty;
  tags: string[];
  category: CategoryResponse;
}

/** Payload for `POST /api/v1/quizzes` and `PUT /api/v1/quizzes/{id}`. */
export interface QuizRequest {
  title: string;
  description: string;
  maxMarks: string;
  numberOfQuestions: string;
  active: boolean;
  difficulty: Difficulty;
  tags: string[];
  categoryId: number;
}

export interface EvaluateQuizRequest {
  answers: Array<{ quesId: number; chosenAnswer: string }>;
}

export interface EvaluateQuizResponse {
  marksGot: number;
  correctAnswers: number;
  attempted: number;
  totalQuestions: number;
}

/** Row of a user's attempt history. */
export interface QuizAttemptResponse {
  id: number;
  quizId: number;
  quizTitle: string;
  categoryTitle: string;
  marksGot: number;
  correctAnswers: number;
  attempted: number;
  totalQuestions: number;
  attemptedAt: string;
}

/** Row of a quiz leaderboard. */
export interface LeaderboardEntry {
  rank: number;
  username: string;
  marksGot: number;
  correctAnswers: number;
  totalQuestions: number;
  attemptedAt: string;
}
