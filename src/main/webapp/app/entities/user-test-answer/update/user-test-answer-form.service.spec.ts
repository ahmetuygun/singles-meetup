import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../user-test-answer.test-samples';

import { UserTestAnswerFormService } from './user-test-answer-form.service';

describe('UserTestAnswer Form Service', () => {
  let service: UserTestAnswerFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTestAnswerFormService);
  });

  describe('Service methods', () => {
    describe('createUserTestAnswerFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createUserTestAnswerFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            answerValue: expect.any(Object),
            timestamp: expect.any(Object),
            question: expect.any(Object),
            personProfile: expect.any(Object),
            answer: expect.any(Object),
          }),
        );
      });

      it('passing IUserTestAnswer should create a new form with FormGroup', () => {
        const formGroup = service.createUserTestAnswerFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            answerValue: expect.any(Object),
            timestamp: expect.any(Object),
            question: expect.any(Object),
            personProfile: expect.any(Object),
            answer: expect.any(Object),
          }),
        );
      });
    });

    describe('getUserTestAnswer', () => {
      it('should return NewUserTestAnswer for default UserTestAnswer initial value', () => {
        const formGroup = service.createUserTestAnswerFormGroup(sampleWithNewData);

        const userTestAnswer = service.getUserTestAnswer(formGroup) as any;

        expect(userTestAnswer).toMatchObject(sampleWithNewData);
      });

      it('should return NewUserTestAnswer for empty UserTestAnswer initial value', () => {
        const formGroup = service.createUserTestAnswerFormGroup();

        const userTestAnswer = service.getUserTestAnswer(formGroup) as any;

        expect(userTestAnswer).toMatchObject({});
      });

      it('should return IUserTestAnswer', () => {
        const formGroup = service.createUserTestAnswerFormGroup(sampleWithRequiredData);

        const userTestAnswer = service.getUserTestAnswer(formGroup) as any;

        expect(userTestAnswer).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IUserTestAnswer should not enable id FormControl', () => {
        const formGroup = service.createUserTestAnswerFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewUserTestAnswer should disable id FormControl', () => {
        const formGroup = service.createUserTestAnswerFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
