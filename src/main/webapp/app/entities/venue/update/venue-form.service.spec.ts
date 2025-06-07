import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../venue.test-samples';

import { VenueFormService } from './venue-form.service';

describe('Venue Form Service', () => {
  let service: VenueFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenueFormService);
  });

  describe('Service methods', () => {
    describe('createVenueFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createVenueFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            address: expect.any(Object),
            city: expect.any(Object),
            capacity: expect.any(Object),
            contactInfo: expect.any(Object),
            photoUrl: expect.any(Object),
          }),
        );
      });

      it('passing IVenue should create a new form with FormGroup', () => {
        const formGroup = service.createVenueFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            address: expect.any(Object),
            city: expect.any(Object),
            capacity: expect.any(Object),
            contactInfo: expect.any(Object),
            photoUrl: expect.any(Object),
          }),
        );
      });
    });

    describe('getVenue', () => {
      it('should return NewVenue for default Venue initial value', () => {
        const formGroup = service.createVenueFormGroup(sampleWithNewData);

        const venue = service.getVenue(formGroup) as any;

        expect(venue).toMatchObject(sampleWithNewData);
      });

      it('should return NewVenue for empty Venue initial value', () => {
        const formGroup = service.createVenueFormGroup();

        const venue = service.getVenue(formGroup) as any;

        expect(venue).toMatchObject({});
      });

      it('should return IVenue', () => {
        const formGroup = service.createVenueFormGroup(sampleWithRequiredData);

        const venue = service.getVenue(formGroup) as any;

        expect(venue).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IVenue should not enable id FormControl', () => {
        const formGroup = service.createVenueFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewVenue should disable id FormControl', () => {
        const formGroup = service.createVenueFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
