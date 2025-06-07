import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../test-answer-option.test-samples';

import { TestAnswerOptionFormService } from './test-answer-option-form.service';

describe('TestAnswerOption Form Service', () => {
  let service: TestAnswerOptionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestAnswerOptionFormService);
  });

  describe('Service methods', () => {
    describe('createTestAnswerOptionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTestAnswerOptionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            optionText: expect.any(Object),
            value: expect.any(Object),
            question: expect.any(Object),
          }),
        );
      });

      it('passing ITestAnswerOption should create a new form with FormGroup', () => {
        const formGroup = service.createTestAnswerOptionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            optionText: expect.any(Object),
            value: expect.any(Object),
            question: expect.any(Object),
          }),
        );
      });
    });

    describe('getTestAnswerOption', () => {
      it('should return NewTestAnswerOption for default TestAnswerOption initial value', () => {
        const formGroup = service.createTestAnswerOptionFormGroup(sampleWithNewData);

        const testAnswerOption = service.getTestAnswerOption(formGroup) as any;

        expect(testAnswerOption).toMatchObject(sampleWithNewData);
      });

      it('should return NewTestAnswerOption for empty TestAnswerOption initial value', () => {
        const formGroup = service.createTestAnswerOptionFormGroup();

        const testAnswerOption = service.getTestAnswerOption(formGroup) as any;

        expect(testAnswerOption).toMatchObject({});
      });

      it('should return ITestAnswerOption', () => {
        const formGroup = service.createTestAnswerOptionFormGroup(sampleWithRequiredData);

        const testAnswerOption = service.getTestAnswerOption(formGroup) as any;

        expect(testAnswerOption).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITestAnswerOption should not enable id FormControl', () => {
        const formGroup = service.createTestAnswerOptionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTestAnswerOption should disable id FormControl', () => {
        const formGroup = service.createTestAnswerOptionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
