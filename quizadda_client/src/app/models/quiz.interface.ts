import { CategoryResponse } from './category.interface';

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
  category: CategoryResponse;
}

/** Payload for `POST /api/v1/quizzes` and `PUT /api/v1/quizzes/{id}`. */
export interface QuizRequest {
  title: string;
  description: string;
  maxMarks: string;
  numberOfQuestions: string;
  active: boolean;
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
