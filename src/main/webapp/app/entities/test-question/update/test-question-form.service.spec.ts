import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../test-question.test-samples';

import { TestQuestionFormService } from './test-question-form.service';

describe('TestQuestion Form Service', () => {
  let service: TestQuestionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestQuestionFormService);
  });

  describe('Service methods', () => {
    describe('createTestQuestionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTestQuestionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            questionText: expect.any(Object),
            questionType: expect.any(Object),
            stepNumber: expect.any(Object),
            isRequired: expect.any(Object),
            category: expect.any(Object),
            language: expect.any(Object),
          }),
        );
      });

      it('passing ITestQuestion should create a new form with FormGroup', () => {
        const formGroup = service.createTestQuestionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            questionText: expect.any(Object),
            questionType: expect.any(Object),
            stepNumber: expect.any(Object),
            isRequired: expect.any(Object),
            category: expect.any(Object),
            language: expect.any(Object),
          }),
        );
      });
    });

    describe('getTestQuestion', () => {
      it('should return NewTestQuestion for default TestQuestion initial value', () => {
        const formGroup = service.createTestQuestionFormGroup(sampleWithNewData);

        const testQuestion = service.getTestQuestion(formGroup) as any;

        expect(testQuestion).toMatchObject(sampleWithNewData);
      });

      it('should return NewTestQuestion for empty TestQuestion initial value', () => {
        const formGroup = service.createTestQuestionFormGroup();

        const testQuestion = service.getTestQuestion(formGroup) as any;

        expect(testQuestion).toMatchObject({});
      });

      it('should return ITestQuestion', () => {
        const formGroup = service.createTestQuestionFormGroup(sampleWithRequiredData);

        const testQuestion = service.getTestQuestion(formGroup) as any;

        expect(testQuestion).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITestQuestion should not enable id FormControl', () => {
        const formGroup = service.createTestQuestionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTestQuestion should disable id FormControl', () => {
        const formGroup = service.createTestQuestionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
