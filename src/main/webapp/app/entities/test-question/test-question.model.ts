import { QuestionType } from 'app/entities/enumerations/question-type.model';
import { CategoryType } from 'app/entities/enumerations/category-type.model';
import { ITestAnswerOption } from '../test-answer-option/test-answer-option.model';

export interface ITestQuestion {
  id: number;
  questionText?: string | null;
  questionType?: keyof typeof QuestionType | null;
  stepNumber?: number | null;
  isRequired?: boolean | null;
  category?: CategoryType | null;
  language?: string | null;
  editable?: boolean | null;
  options?: ITestAnswerOption[] | null;
}

export type NewTestQuestion = Omit<ITestQuestion, 'id'> & { id: null };
