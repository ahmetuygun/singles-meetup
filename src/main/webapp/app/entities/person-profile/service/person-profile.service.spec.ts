import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IPersonProfile } from '../person-profile.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../person-profile.test-samples';

import { PersonProfileService, RestPersonProfile } from './person-profile.service';

const requireRestSample: RestPersonProfile = {
  ...sampleWithRequiredData,
  dob: sampleWithRequiredData.dob?.format(DATE_FORMAT),
};

describe('PersonProfile Service', () => {
  let service: PersonProfileService;
  let httpMock: HttpTestingController;
  let expectedResult: IPersonProfile | IPersonProfile[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PersonProfileService);
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

    it('should create a PersonProfile', () => {
      const personProfile = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(personProfile).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PersonProfile', () => {
      const personProfile = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(personProfile).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PersonProfile', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PersonProfile', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PersonProfile', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPersonProfileToCollectionIfMissing', () => {
      it('should add a PersonProfile to an empty array', () => {
        const personProfile: IPersonProfile = sampleWithRequiredData;
        expectedResult = service.addPersonProfileToCollectionIfMissing([], personProfile);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(personProfile);
      });

      it('should not add a PersonProfile to an array that contains it', () => {
        const personProfile: IPersonProfile = sampleWithRequiredData;
        const personProfileCollection: IPersonProfile[] = [
          {
            ...personProfile,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPersonProfileToCollectionIfMissing(personProfileCollection, personProfile);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PersonProfile to an array that doesn't contain it", () => {
        const personProfile: IPersonProfile = sampleWithRequiredData;
        const personProfileCollection: IPersonProfile[] = [sampleWithPartialData];
        expectedResult = service.addPersonProfileToCollectionIfMissing(personProfileCollection, personProfile);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(personProfile);
      });

      it('should add only unique PersonProfile to an array', () => {
        const personProfileArray: IPersonProfile[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const personProfileCollection: IPersonProfile[] = [sampleWithRequiredData];
        expectedResult = service.addPersonProfileToCollectionIfMissing(personProfileCollection, ...personProfileArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const personProfile: IPersonProfile = sampleWithRequiredData;
        const personProfile2: IPersonProfile = sampleWithPartialData;
        expectedResult = service.addPersonProfileToCollectionIfMissing([], personProfile, personProfile2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(personProfile);
        expect(expectedResult).toContain(personProfile2);
      });

      it('should accept null and undefined values', () => {
        const personProfile: IPersonProfile = sampleWithRequiredData;
        expectedResult = service.addPersonProfileToCollectionIfMissing([], null, personProfile, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(personProfile);
      });

      it('should return initial array if no PersonProfile is added', () => {
        const personProfileCollection: IPersonProfile[] = [sampleWithRequiredData];
        expectedResult = service.addPersonProfileToCollectionIfMissing(personProfileCollection, undefined, null);
        expect(expectedResult).toEqual(personProfileCollection);
      });
    });

    describe('comparePersonProfile', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePersonProfile(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 25470 };
        const entity2 = null;

        const compareResult1 = service.comparePersonProfile(entity1, entity2);
        const compareResult2 = service.comparePersonProfile(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 25470 };
        const entity2 = { id: 22909 };

        const compareResult1 = service.comparePersonProfile(entity1, entity2);
        const compareResult2 = service.comparePersonProfile(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 25470 };
        const entity2 = { id: 25470 };

        const compareResult1 = service.comparePersonProfile(entity1, entity2);
        const compareResult2 = service.comparePersonProfile(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
