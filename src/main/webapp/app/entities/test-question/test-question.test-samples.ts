import { ITestQuestion, NewTestQuestion } from './test-question.model';

export const sampleWithRequiredData: ITestQuestion = {
  id: 13064,
  questionText: 'pfft trash form',
  questionType: 'AUTOCOMPLETE_INPUT',
  isRequired: true,
  language: 'suspiciously nor neatly',
};

export const sampleWithPartialData: ITestQuestion = {
  id: 11427,
  questionText: 'rival hard-to-find hope',
  questionType: 'NUMBER_INPUT',
  isRequired: true,
  category: 'furthermore',
  language: 'for towards',
};

export const sampleWithFullData: ITestQuestion = {
  id: 28940,
  questionText: 'athwart importance wholly',
  questionType: 'DATE_INPUT',
  stepNumber: 22080,
  isRequired: false,
  category: 'every ah supposing',
  language: 'jell on',
};

export const sampleWithNewData: NewTestQuestion = {
  questionText: 'across instead heavily',
  questionType: 'AUTOCOMPLETE_INPUT',
  isRequired: false,
  language: 'an drat intend',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
