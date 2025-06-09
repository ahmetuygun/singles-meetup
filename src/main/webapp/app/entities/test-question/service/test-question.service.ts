import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITestQuestion, NewTestQuestion } from '../test-question.model';

export type PartialUpdateTestQuestion = Partial<ITestQuestion> & Pick<ITestQuestion, 'id'>;

export type EntityResponseType = HttpResponse<ITestQuestion>;
export type EntityArrayResponseType = HttpResponse<ITestQuestion[]>;

@Injectable({ providedIn: 'root' })
export class TestQuestionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/test-questions');

  create(testQuestion: NewTestQuestion): Observable<EntityResponseType> {
    return this.http.post<ITestQuestion>(this.resourceUrl, testQuestion, { observe: 'response' });
  }

  update(testQuestion: ITestQuestion): Observable<EntityResponseType> {
    return this.http.put<ITestQuestion>(`${this.resourceUrl}/${this.getTestQuestionIdentifier(testQuestion)}`, testQuestion, {
      observe: 'response',
    });
  }

  partialUpdate(testQuestion: PartialUpdateTestQuestion): Observable<EntityResponseType> {
    return this.http.patch<ITestQuestion>(`${this.resourceUrl}/${this.getTestQuestionIdentifier(testQuestion)}`, testQuestion, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITestQuestion>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITestQuestion[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  queryWithOptions(): Observable<EntityArrayResponseType> {
    return this.http.get<ITestQuestion[]>(`${this.resourceUrl}/with-options`, { observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTestQuestionIdentifier(testQuestion: Pick<ITestQuestion, 'id'>): number {
    return testQuestion.id;
  }

  compareTestQuestion(o1: Pick<ITestQuestion, 'id'> | null, o2: Pick<ITestQuestion, 'id'> | null): boolean {
    return o1 && o2 ? this.getTestQuestionIdentifier(o1) === this.getTestQuestionIdentifier(o2) : o1 === o2;
  }

  addTestQuestionToCollectionIfMissing<Type extends Pick<ITestQuestion, 'id'>>(
    testQuestionCollection: Type[],
    ...testQuestionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const testQuestions: Type[] = testQuestionsToCheck.filter(isPresent);
    if (testQuestions.length > 0) {
      const testQuestionCollectionIdentifiers = testQuestionCollection.map(testQuestionItem =>
        this.getTestQuestionIdentifier(testQuestionItem),
      );
      const testQuestionsToAdd = testQuestions.filter(testQuestionItem => {
        const testQuestionIdentifier = this.getTestQuestionIdentifier(testQuestionItem);
        if (testQuestionCollectionIdentifiers.includes(testQuestionIdentifier)) {
          return false;
        }
        testQuestionCollectionIdentifiers.push(testQuestionIdentifier);
        return true;
      });
      return [...testQuestionsToAdd, ...testQuestionCollection];
    }
    return testQuestionCollection;
  }
}
