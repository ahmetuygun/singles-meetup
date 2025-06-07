import { ITestQuestion } from 'app/entities/test-question/test-question.model';

export interface ITestAnswerOption {
  id: number;
  optionText?: string | null;
  value?: number | null;
  question?: ITestQuestion | null;
}

export type NewTestAnswerOption = Omit<ITestAnswerOption, 'id'> & { id: null };
