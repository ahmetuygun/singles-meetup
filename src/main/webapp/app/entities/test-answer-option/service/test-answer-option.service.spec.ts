import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ITestAnswerOption } from '../test-answer-option.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../test-answer-option.test-samples';

import { TestAnswerOptionService } from './test-answer-option.service';

const requireRestSample: ITestAnswerOption = {
  ...sampleWithRequiredData,
};

describe('TestAnswerOption Service', () => {
  let service: TestAnswerOptionService;
  let httpMock: HttpTestingController;
  let expectedResult: ITestAnswerOption | ITestAnswerOption[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TestAnswerOptionService);
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

    it('should create a TestAnswerOption', () => {
      const testAnswerOption = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(testAnswerOption).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TestAnswerOption', () => {
      const testAnswerOption = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(testAnswerOption).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TestAnswerOption', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TestAnswerOption', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TestAnswerOption', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTestAnswerOptionToCollectionIfMissing', () => {
      it('should add a TestAnswerOption to an empty array', () => {
        const testAnswerOption: ITestAnswerOption = sampleWithRequiredData;
        expectedResult = service.addTestAnswerOptionToCollectionIfMissing([], testAnswerOption);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(testAnswerOption);
      });

      it('should not add a TestAnswerOption to an array that contains it', () => {
        const testAnswerOption: ITestAnswerOption = sampleWithRequiredData;
        const testAnswerOptionCollection: ITestAnswerOption[] = [
          {
            ...testAnswerOption,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTestAnswerOptionToCollectionIfMissing(testAnswerOptionCollection, testAnswerOption);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TestAnswerOption to an array that doesn't contain it", () => {
        const testAnswerOption: ITestAnswerOption = sampleWithRequiredData;
        const testAnswerOptionCollection: ITestAnswerOption[] = [sampleWithPartialData];
        expectedResult = service.addTestAnswerOptionToCollectionIfMissing(testAnswerOptionCollection, testAnswerOption);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(testAnswerOption);
      });

      it('should add only unique TestAnswerOption to an array', () => {
        const testAnswerOptionArray: ITestAnswerOption[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const testAnswerOptionCollection: ITestAnswerOption[] = [sampleWithRequiredData];
        expectedResult = service.addTestAnswerOptionToCollectionIfMissing(testAnswerOptionCollection, ...testAnswerOptionArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const testAnswerOption: ITestAnswerOption = sampleWithRequiredData;
        const testAnswerOption2: ITestAnswerOption = sampleWithPartialData;
        expectedResult = service.addTestAnswerOptionToCollectionIfMissing([], testAnswerOption, testAnswerOption2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(testAnswerOption);
        expect(expectedResult).toContain(testAnswerOption2);
      });

      it('should accept null and undefined values', () => {
        const testAnswerOption: ITestAnswerOption = sampleWithRequiredData;
        expectedResult = service.addTestAnswerOptionToCollectionIfMissing([], null, testAnswerOption, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(testAnswerOption);
      });

      it('should return initial array if no TestAnswerOption is added', () => {
        const testAnswerOptionCollection: ITestAnswerOption[] = [sampleWithRequiredData];
        expectedResult = service.addTestAnswerOptionToCollectionIfMissing(testAnswerOptionCollection, undefined, null);
        expect(expectedResult).toEqual(testAnswerOptionCollection);
      });
    });

    describe('compareTestAnswerOption', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTestAnswerOption(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 15811 };
        const entity2 = null;

        const compareResult1 = service.compareTestAnswerOption(entity1, entity2);
        const compareResult2 = service.compareTestAnswerOption(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 15811 };
        const entity2 = { id: 13543 };

        const compareResult1 = service.compareTestAnswerOption(entity1, entity2);
        const compareResult2 = service.compareTestAnswerOption(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 15811 };
        const entity2 = { id: 15811 };

        const compareResult1 = service.compareTestAnswerOption(entity1, entity2);
        const compareResult2 = service.compareTestAnswerOption(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
