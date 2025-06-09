import { QuestionType } from 'app/entities/enumerations/question-type.model';
import { ITestAnswerOption } from '../test-answer-option/test-answer-option.model';

export interface ITestQuestion {
  id: number;
  questionText?: string | null;
  questionType?: keyof typeof QuestionType | null;
  stepNumber?: number | null;
  isRequired?: boolean | null;
  category?: string | null;
  language?: string | null;
  options?: ITestAnswerOption[] | null;
}

export type NewTestQuestion = Omit<ITestQuestion, 'id'> & { id: null };
