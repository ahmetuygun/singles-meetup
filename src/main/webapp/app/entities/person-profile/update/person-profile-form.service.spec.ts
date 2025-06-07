import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../person-profile.test-samples';

import { PersonProfileFormService } from './person-profile-form.service';

describe('PersonProfile Form Service', () => {
  let service: PersonProfileFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonProfileFormService);
  });

  describe('Service methods', () => {
    describe('createPersonProfileFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPersonProfileFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            firstName: expect.any(Object),
            lastName: expect.any(Object),
            dob: expect.any(Object),
            gender: expect.any(Object),
            bio: expect.any(Object),
            interests: expect.any(Object),
            location: expect.any(Object),
            internalUser: expect.any(Object),
            events: expect.any(Object),
          }),
        );
      });

      it('passing IPersonProfile should create a new form with FormGroup', () => {
        const formGroup = service.createPersonProfileFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            firstName: expect.any(Object),
            lastName: expect.any(Object),
            dob: expect.any(Object),
            gender: expect.any(Object),
            bio: expect.any(Object),
            interests: expect.any(Object),
            location: expect.any(Object),
            internalUser: expect.any(Object),
            events: expect.any(Object),
          }),
        );
      });
    });

    describe('getPersonProfile', () => {
      it('should return NewPersonProfile for default PersonProfile initial value', () => {
        const formGroup = service.createPersonProfileFormGroup(sampleWithNewData);

        const personProfile = service.getPersonProfile(formGroup) as any;

        expect(personProfile).toMatchObject(sampleWithNewData);
      });

      it('should return NewPersonProfile for empty PersonProfile initial value', () => {
        const formGroup = service.createPersonProfileFormGroup();

        const personProfile = service.getPersonProfile(formGroup) as any;

        expect(personProfile).toMatchObject({});
      });

      it('should return IPersonProfile', () => {
        const formGroup = service.createPersonProfileFormGroup(sampleWithRequiredData);

        const personProfile = service.getPersonProfile(formGroup) as any;

        expect(personProfile).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPersonProfile should not enable id FormControl', () => {
        const formGroup = service.createPersonProfileFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPersonProfile should disable id FormControl', () => {
        const formGroup = service.createPersonProfileFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
