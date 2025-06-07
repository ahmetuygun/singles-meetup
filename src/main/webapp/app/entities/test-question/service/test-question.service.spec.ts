import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ITestQuestion } from '../test-question.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../test-question.test-samples';

import { TestQuestionService } from './test-question.service';

const requireRestSample: ITestQuestion = {
  ...sampleWithRequiredData,
};

describe('TestQuestion Service', () => {
  let service: TestQuestionService;
  let httpMock: HttpTestingController;
  let expectedResult: ITestQuestion | ITestQuestion[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TestQuestionService);
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

    it('should create a TestQuestion', () => {
      const testQuestion = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(testQuestion).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TestQuestion', () => {
      const testQuestion = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(testQuestion).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TestQuestion', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TestQuestion', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TestQuestion', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTestQuestionToCollectionIfMissing', () => {
      it('should add a TestQuestion to an empty array', () => {
        const testQuestion: ITestQuestion = sampleWithRequiredData;
        expectedResult = service.addTestQuestionToCollectionIfMissing([], testQuestion);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(testQuestion);
      });

      it('should not add a TestQuestion to an array that contains it', () => {
        const testQuestion: ITestQuestion = sampleWithRequiredData;
        const testQuestionCollection: ITestQuestion[] = [
          {
            ...testQuestion,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTestQuestionToCollectionIfMissing(testQuestionCollection, testQuestion);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TestQuestion to an array that doesn't contain it", () => {
        const testQuestion: ITestQuestion = sampleWithRequiredData;
        const testQuestionCollection: ITestQuestion[] = [sampleWithPartialData];
        expectedResult = service.addTestQuestionToCollectionIfMissing(testQuestionCollection, testQuestion);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(testQuestion);
      });

      it('should add only unique TestQuestion to an array', () => {
        const testQuestionArray: ITestQuestion[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const testQuestionCollection: ITestQuestion[] = [sampleWithRequiredData];
        expectedResult = service.addTestQuestionToCollectionIfMissing(testQuestionCollection, ...testQuestionArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const testQuestion: ITestQuestion = sampleWithRequiredData;
        const testQuestion2: ITestQuestion = sampleWithPartialData;
        expectedResult = service.addTestQuestionToCollectionIfMissing([], testQuestion, testQuestion2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(testQuestion);
        expect(expectedResult).toContain(testQuestion2);
      });

      it('should accept null and undefined values', () => {
        const testQuestion: ITestQuestion = sampleWithRequiredData;
        expectedResult = service.addTestQuestionToCollectionIfMissing([], null, testQuestion, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(testQuestion);
      });

      it('should return initial array if no TestQuestion is added', () => {
        const testQuestionCollection: ITestQuestion[] = [sampleWithRequiredData];
        expectedResult = service.addTestQuestionToCollectionIfMissing(testQuestionCollection, undefined, null);
        expect(expectedResult).toEqual(testQuestionCollection);
      });
    });

    describe('compareTestQuestion', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTestQuestion(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 24178 };
        const entity2 = null;

        const compareResult1 = service.compareTestQuestion(entity1, entity2);
        const compareResult2 = service.compareTestQuestion(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 24178 };
        const entity2 = { id: 18143 };

        const compareResult1 = service.compareTestQuestion(entity1, entity2);
        const compareResult2 = service.compareTestQuestion(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 24178 };
        const entity2 = { id: 24178 };

        const compareResult1 = service.compareTestQuestion(entity1, entity2);
        const compareResult2 = service.compareTestQuestion(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
