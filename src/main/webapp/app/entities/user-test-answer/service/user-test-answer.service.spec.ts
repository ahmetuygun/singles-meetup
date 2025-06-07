import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IUserTestAnswer } from '../user-test-answer.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../user-test-answer.test-samples';

import { RestUserTestAnswer, UserTestAnswerService } from './user-test-answer.service';

const requireRestSample: RestUserTestAnswer = {
  ...sampleWithRequiredData,
  timestamp: sampleWithRequiredData.timestamp?.toJSON(),
};

describe('UserTestAnswer Service', () => {
  let service: UserTestAnswerService;
  let httpMock: HttpTestingController;
  let expectedResult: IUserTestAnswer | IUserTestAnswer[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(UserTestAnswerService);
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

    it('should create a UserTestAnswer', () => {
      const userTestAnswer = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(userTestAnswer).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a UserTestAnswer', () => {
      const userTestAnswer = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(userTestAnswer).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a UserTestAnswer', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of UserTestAnswer', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a UserTestAnswer', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addUserTestAnswerToCollectionIfMissing', () => {
      it('should add a UserTestAnswer to an empty array', () => {
        const userTestAnswer: IUserTestAnswer = sampleWithRequiredData;
        expectedResult = service.addUserTestAnswerToCollectionIfMissing([], userTestAnswer);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(userTestAnswer);
      });

      it('should not add a UserTestAnswer to an array that contains it', () => {
        const userTestAnswer: IUserTestAnswer = sampleWithRequiredData;
        const userTestAnswerCollection: IUserTestAnswer[] = [
          {
            ...userTestAnswer,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addUserTestAnswerToCollectionIfMissing(userTestAnswerCollection, userTestAnswer);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a UserTestAnswer to an array that doesn't contain it", () => {
        const userTestAnswer: IUserTestAnswer = sampleWithRequiredData;
        const userTestAnswerCollection: IUserTestAnswer[] = [sampleWithPartialData];
        expectedResult = service.addUserTestAnswerToCollectionIfMissing(userTestAnswerCollection, userTestAnswer);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userTestAnswer);
      });

      it('should add only unique UserTestAnswer to an array', () => {
        const userTestAnswerArray: IUserTestAnswer[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const userTestAnswerCollection: IUserTestAnswer[] = [sampleWithRequiredData];
        expectedResult = service.addUserTestAnswerToCollectionIfMissing(userTestAnswerCollection, ...userTestAnswerArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const userTestAnswer: IUserTestAnswer = sampleWithRequiredData;
        const userTestAnswer2: IUserTestAnswer = sampleWithPartialData;
        expectedResult = service.addUserTestAnswerToCollectionIfMissing([], userTestAnswer, userTestAnswer2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(userTestAnswer);
        expect(expectedResult).toContain(userTestAnswer2);
      });

      it('should accept null and undefined values', () => {
        const userTestAnswer: IUserTestAnswer = sampleWithRequiredData;
        expectedResult = service.addUserTestAnswerToCollectionIfMissing([], null, userTestAnswer, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(userTestAnswer);
      });

      it('should return initial array if no UserTestAnswer is added', () => {
        const userTestAnswerCollection: IUserTestAnswer[] = [sampleWithRequiredData];
        expectedResult = service.addUserTestAnswerToCollectionIfMissing(userTestAnswerCollection, undefined, null);
        expect(expectedResult).toEqual(userTestAnswerCollection);
      });
    });

    describe('compareUserTestAnswer', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareUserTestAnswer(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 13099 };
        const entity2 = null;

        const compareResult1 = service.compareUserTestAnswer(entity1, entity2);
        const compareResult2 = service.compareUserTestAnswer(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 13099 };
        const entity2 = { id: 5655 };

        const compareResult1 = service.compareUserTestAnswer(entity1, entity2);
        const compareResult2 = service.compareUserTestAnswer(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 13099 };
        const entity2 = { id: 13099 };

        const compareResult1 = service.compareUserTestAnswer(entity1, entity2);
        const compareResult2 = service.compareUserTestAnswer(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
