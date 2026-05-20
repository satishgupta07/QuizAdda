/**
 * Question response. `answer` is omitted for the user-facing "take quiz" endpoint
 * so a determined client can't peek at correct answers via DevTools.
 */
export interface QuestionResponse {
  quesId: number;
  content: string;
  image?: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer?: string;
  quizId: number;
}

export interface QuestionRequest {
  content: string;
  image?: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
  quizId: number;
}

/** Augments a `QuestionResponse` with the locally-tracked chosen answer while taking a quiz. */
export interface QuizAttemptQuestion extends QuestionResponse {
  chosenAnswer: string;
}
