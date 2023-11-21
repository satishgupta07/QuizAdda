import { Category } from "./category.interface";

export interface Quiz {
  quizId: number;
  title: string;
  description: string;
  maxMarks: number;
  numberOfQuestions: number;
  category: Category;
  active: boolean;
}
