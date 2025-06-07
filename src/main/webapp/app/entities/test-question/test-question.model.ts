import { QuestionType } from 'app/entities/enumerations/question-type.model';

export interface ITestQuestion {
  id: number;
  questionText?: string | null;
  questionType?: keyof typeof QuestionType | null;
  stepNumber?: number | null;
  isRequired?: boolean | null;
  category?: string | null;
  language?: string | null;
}

export type NewTestQuestion = Omit<ITestQuestion, 'id'> & { id: null };
