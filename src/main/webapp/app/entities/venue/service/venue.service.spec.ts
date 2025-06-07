import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IVenue } from '../venue.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../venue.test-samples';

import { VenueService } from './venue.service';

const requireRestSample: IVenue = {
  ...sampleWithRequiredData,
};

describe('Venue Service', () => {
  let service: VenueService;
  let httpMock: HttpTestingController;
  let expectedResult: IVenue | IVenue[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(VenueService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Venue', () => {
      const venue = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(venue).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Venue', () => {
      const venue = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(venue).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Venue', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Venue', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Venue', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addVenueToCollectionIfMissing', () => {
      it('should add a Venue to an empty array', () => {
        const venue: IVenue = sampleWithRequiredData;
        expectedResult = service.addVenueToCollectionIfMissing([], venue);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(venue);
      });

      it('should not add a Venue to an array that contains it', () => {
        const venue: IVenue = sampleWithRequiredData;
        const venueCollection: IVenue[] = [
          {
            ...venue,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addVenueToCollectionIfMissing(venueCollection, venue);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Venue to an array that doesn't contain it", () => {
        const venue: IVenue = sampleWithRequiredData;
        const venueCollection: IVenue[] = [sampleWithPartialData];
        expectedResult = service.addVenueToCollectionIfMissing(venueCollection, venue);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(venue);
      });

      it('should add only unique Venue to an array', () => {
        const venueArray: IVenue[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const venueCollection: IVenue[] = [sampleWithRequiredData];
        expectedResult = service.addVenueToCollectionIfMissing(venueCollection, ...venueArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const venue: IVenue = sampleWithRequiredData;
        const venue2: IVenue = sampleWithPartialData;
        expectedResult = service.addVenueToCollectionIfMissing([], venue, venue2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(venue);
        expect(expectedResult).toContain(venue2);
      });

      it('should accept null and undefined values', () => {
        const venue: IVenue = sampleWithRequiredData;
        expectedResult = service.addVenueToCollectionIfMissing([], null, venue, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(venue);
      });

      it('should return initial array if no Venue is added', () => {
        const venueCollection: IVenue[] = [sampleWithRequiredData];
        expectedResult = service.addVenueToCollectionIfMissing(venueCollection, undefined, null);
        expect(expectedResult).toEqual(venueCollection);
      });
    });

    describe('compareVenue', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareVenue(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 5387 };
        const entity2 = null;

        const compareResult1 = service.compareVenue(entity1, entity2);
        const compareResult2 = service.compareVenue(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 5387 };
        const entity2 = { id: 22163 };

        const compareResult1 = service.compareVenue(entity1, entity2);
        const compareResult2 = service.compareVenue(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 5387 };
        const entity2 = { id: 5387 };

        const compareResult1 = service.compareVenue(entity1, entity2);
        const compareResult2 = service.compareVenue(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
