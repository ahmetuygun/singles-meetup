import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IUserEvent } from '../user-event.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../user-event.test-samples';

import { UserEventService } from './user-event.service';

const requireRestSample: IUserEvent = {
  ...sampleWithRequiredData,
};

describe('UserEvent Service', () => {
  let service: UserEventService;
  let httpMock: HttpTestingController;
  let expectedResult: IUserEvent | IUserEvent[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(UserEventService);
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

    it('should create a UserEvent', () => {
      const userEvent = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(userEvent).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a UserEvent', () => {
      const userEvent = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(userEvent).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a UserEvent', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of UserEvent', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a UserEvent', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addUserEventToCollectionIfMissing', () => {
      it('should add a UserEvent to an empty array', () => {
        const userEvent: IUserEvent = sampleWithRequiredData;
        expectedResult = service.addUserEventToCollectionIfMissing([], userEvent);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(userEvent);
      });

      it('should not add a UserEvent to an array that contains it', () => {
        const userEvent: IUserEvent = sampleWithRequiredData;
        const userEventCollection: IUserEvent[] = [
          {
            ...userEvent,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addUserEventToCollectionIfMissing(userEventCollection, userEvent);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a UserEvent to an array that doesn't contain it", () => {
        const userEvent: IUserEvent = sampleWithRequiredData;
        const userEventCollection: IUserEvent[] = [sampleWithPartialData];
        expectedResult = service.addUserEventToCollectionIfMissing(userEventCollection, userEvent);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userEvent);
      });

      it('should add only unique UserEvent to an array', () => {
        const userEventArray: IUserEvent[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const userEventCollection: IUserEvent[] = [sampleWithRequiredData];
        expectedResult = service.addUserEventToCollectionIfMissing(userEventCollection, ...userEventArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const userEvent: IUserEvent = sampleWithRequiredData;
        const userEvent2: IUserEvent = sampleWithPartialData;
        expectedResult = service.addUserEventToCollectionIfMissing([], userEvent, userEvent2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userEvent);
        expect(expectedResult).toContain(userEvent2);
      });

      it('should accept null and undefined values', () => {
        const userEvent: IUserEvent = sampleWithRequiredData;
        expectedResult = service.addUserEventToCollectionIfMissing([], null, userEvent, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(userEvent);
      });

      it('should return initial array if no UserEvent is added', () => {
        const userEventCollection: IUserEvent[] = [sampleWithRequiredData];
        expectedResult = service.addUserEventToCollectionIfMissing(userEventCollection, undefined, null);
        expect(expectedResult).toEqual(userEventCollection);
      });
    });

    describe('compareUserEvent', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareUserEvent(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 16068 };
        const entity2 = null;

        const compareResult1 = service.compareUserEvent(entity1, entity2);
        const compareResult2 = service.compareUserEvent(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 16068 };
        const entity2 = { id: 16449 };

        const compareResult1 = service.compareUserEvent(entity1, entity2);
        const compareResult2 = service.compareUserEvent(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 16068 };
        const entity2 = { id: 16068 };

        const compareResult1 = service.compareUserEvent(entity1, entity2);
        const compareResult2 = service.compareUserEvent(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
