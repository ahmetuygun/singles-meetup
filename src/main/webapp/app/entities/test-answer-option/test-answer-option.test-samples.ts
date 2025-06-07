import { ITestAnswerOption, NewTestAnswerOption } from './test-answer-option.model';

export const sampleWithRequiredData: ITestAnswerOption = {
  id: 30142,
  optionText: 'voluntarily beneath before',
};

export const sampleWithPartialData: ITestAnswerOption = {
  id: 3897,
  optionText: 'mothball typeface',
};

export const sampleWithFullData: ITestAnswerOption = {
  id: 26546,
  optionText: 'infinite whenever',
  value: 973,
};

export const sampleWithNewData: NewTestAnswerOption = {
  optionText: 'meh',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
