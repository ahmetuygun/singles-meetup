import dayjs from 'dayjs/esm';
import { ITestQuestion } from 'app/entities/test-question/test-question.model';
import { IPersonProfile } from 'app/entities/person-profile/person-profile.model';
import { ITestAnswerOption } from 'app/entities/test-answer-option/test-answer-option.model';

export interface IUserTestAnswer {
  id: number;
  answerValue?: number | null;
  timestamp?: dayjs.Dayjs | null;
  question?: ITestQuestion | null;
  personProfile?: IPersonProfile | null;
  answer?: ITestAnswerOption | null;
}

export type NewUserTestAnswer = Omit<IUserTestAnswer, 'id'> & { id: null };
