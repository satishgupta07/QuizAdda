import { Quiz } from "./quiz.interface";

export interface Question {
  quesId: number;
  content: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
  quiz: Quiz;
}
