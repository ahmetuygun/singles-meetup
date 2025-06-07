import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../user-event.test-samples';

import { UserEventFormService } from './user-event-form.service';

describe('UserEvent Form Service', () => {
  let service: UserEventFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserEventFormService);
  });

  describe('Service methods', () => {
    describe('createUserEventFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createUserEventFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            status: expect.any(Object),
            checkedIn: expect.any(Object),
            matchCompleted: expect.any(Object),
            paymentStatus: expect.any(Object),
            personProfile: expect.any(Object),
            event: expect.any(Object),
          }),
        );
      });

      it('passing IUserEvent should create a new form with FormGroup', () => {
        const formGroup = service.createUserEventFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            status: expect.any(Object),
            checkedIn: expect.any(Object),
            matchCompleted: expect.any(Object),
            paymentStatus: expect.any(Object),
            personProfile: expect.any(Object),
            event: expect.any(Object),
          }),
        );
      });
    });

    describe('getUserEvent', () => {
      it('should return NewUserEvent for default UserEvent initial value', () => {
        const formGroup = service.createUserEventFormGroup(sampleWithNewData);

        const userEvent = service.getUserEvent(formGroup) as any;

        expect(userEvent).toMatchObject(sampleWithNewData);
      });

      it('should return NewUserEvent for empty UserEvent initial value', () => {
        const formGroup = service.createUserEventFormGroup();

        const userEvent = service.getUserEvent(formGroup) as any;

        expect(userEvent).toMatchObject({});
      });

      it('should return IUserEvent', () => {
        const formGroup = service.createUserEventFormGroup(sampleWithRequiredData);

        const userEvent = service.getUserEvent(formGroup) as any;

        expect(userEvent).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IUserEvent should not enable id FormControl', () => {
        const formGroup = service.createUserEventFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewUserEvent should disable id FormControl', () => {
        const formGroup = service.createUserEventFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
