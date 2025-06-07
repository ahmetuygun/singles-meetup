import dayjs from 'dayjs/esm';

import { IUserTestAnswer, NewUserTestAnswer } from './user-test-answer.model';

export const sampleWithRequiredData: IUserTestAnswer = {
  id: 16365,
  answerValue: 23467,
};

export const sampleWithPartialData: IUserTestAnswer = {
  id: 28272,
  answerValue: 6998,
  timestamp: dayjs('2025-06-07T04:02'),
};

export const sampleWithFullData: IUserTestAnswer = {
  id: 14376,
  answerValue: 25218,
  timestamp: dayjs('2025-06-07T00:21'),
};

export const sampleWithNewData: NewUserTestAnswer = {
  answerValue: 5707,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
