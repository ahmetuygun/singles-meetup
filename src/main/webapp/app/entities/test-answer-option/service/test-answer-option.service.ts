import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITestAnswerOption, NewTestAnswerOption } from '../test-answer-option.model';

export type PartialUpdateTestAnswerOption = Partial<ITestAnswerOption> & Pick<ITestAnswerOption, 'id'>;

export type EntityResponseType = HttpResponse<ITestAnswerOption>;
export type EntityArrayResponseType = HttpResponse<ITestAnswerOption[]>;

@Injectable({ providedIn: 'root' })
export class TestAnswerOptionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/test-answer-options');

  create(testAnswerOption: NewTestAnswerOption): Observable<EntityResponseType> {
    return this.http.post<ITestAnswerOption>(this.resourceUrl, testAnswerOption, { observe: 'response' });
  }

  update(testAnswerOption: ITestAnswerOption): Observable<EntityResponseType> {
    return this.http.put<ITestAnswerOption>(
      `${this.resourceUrl}/${this.getTestAnswerOptionIdentifier(testAnswerOption)}`,
      testAnswerOption,
      { observe: 'response' },
    );
  }

  partialUpdate(testAnswerOption: PartialUpdateTestAnswerOption): Observable<EntityResponseType> {
    return this.http.patch<ITestAnswerOption>(
      `${this.resourceUrl}/${this.getTestAnswerOptionIdentifier(testAnswerOption)}`,
      testAnswerOption,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITestAnswerOption>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITestAnswerOption[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTestAnswerOptionIdentifier(testAnswerOption: Pick<ITestAnswerOption, 'id'>): number {
    return testAnswerOption.id;
  }

  compareTestAnswerOption(o1: Pick<ITestAnswerOption, 'id'> | null, o2: Pick<ITestAnswerOption, 'id'> | null): boolean {
    return o1 && o2 ? this.getTestAnswerOptionIdentifier(o1) === this.getTestAnswerOptionIdentifier(o2) : o1 === o2;
  }

  addTestAnswerOptionToCollectionIfMissing<Type extends Pick<ITestAnswerOption, 'id'>>(
    testAnswerOptionCollection: Type[],
    ...testAnswerOptionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const testAnswerOptions: Type[] = testAnswerOptionsToCheck.filter(isPresent);
    if (testAnswerOptions.length > 0) {
      const testAnswerOptionCollectionIdentifiers = testAnswerOptionCollection.map(testAnswerOptionItem =>
        this.getTestAnswerOptionIdentifier(testAnswerOptionItem),
      );
      const testAnswerOptionsToAdd = testAnswerOptions.filter(testAnswerOptionItem => {
        const testAnswerOptionIdentifier = this.getTestAnswerOptionIdentifier(testAnswerOptionItem);
        if (testAnswerOptionCollectionIdentifiers.includes(testAnswerOptionIdentifier)) {
          return false;
        }
        testAnswerOptionCollectionIdentifiers.push(testAnswerOptionIdentifier);
        return true;
      });
      return [...testAnswerOptionsToAdd, ...testAnswerOptionCollection];
    }
    return testAnswerOptionCollection;
  }
}
