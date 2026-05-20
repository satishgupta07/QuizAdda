/** Admin analytics rollup (mirror of `AnalyticsResponse.java`). */
export interface AnalyticsResponse {
  totalUsers: number;
  totalCategories: number;
  totalQuizzes: number;
  activeQuizzes: number;
  totalQuestions: number;
  totalAttempts: number;
  topQuizzes: QuizStats[];
}

export interface QuizStats {
  quizId: number;
  quizTitle: string;
  categoryTitle: string;
  attemptCount: number;
  averageScore: number;
}
