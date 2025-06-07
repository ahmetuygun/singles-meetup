import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IUserTestAnswer, NewUserTestAnswer } from '../user-test-answer.model';

export type PartialUpdateUserTestAnswer = Partial<IUserTestAnswer> & Pick<IUserTestAnswer, 'id'>;

type RestOf<T extends IUserTestAnswer | NewUserTestAnswer> = Omit<T, 'timestamp'> & {
  timestamp?: string | null;
};

export type RestUserTestAnswer = RestOf<IUserTestAnswer>;

export type NewRestUserTestAnswer = RestOf<NewUserTestAnswer>;

export type PartialUpdateRestUserTestAnswer = RestOf<PartialUpdateUserTestAnswer>;

export type EntityResponseType = HttpResponse<IUserTestAnswer>;
export type EntityArrayResponseType = HttpResponse<IUserTestAnswer[]>;

@Injectable({ providedIn: 'root' })
export class UserTestAnswerService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/user-test-answers');

  create(userTestAnswer: NewUserTestAnswer): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(userTestAnswer);
    return this.http
      .post<RestUserTestAnswer>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(userTestAnswer: IUserTestAnswer): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(userTestAnswer);
    return this.http
      .put<RestUserTestAnswer>(`${this.resourceUrl}/${this.getUserTestAnswerIdentifier(userTestAnswer)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(userTestAnswer: PartialUpdateUserTestAnswer): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(userTestAnswer);
    return this.http
      .patch<RestUserTestAnswer>(`${this.resourceUrl}/${this.getUserTestAnswerIdentifier(userTestAnswer)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestUserTestAnswer>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestUserTestAnswer[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getUserTestAnswerIdentifier(userTestAnswer: Pick<IUserTestAnswer, 'id'>): number {
    return userTestAnswer.id;
  }

  compareUserTestAnswer(o1: Pick<IUserTestAnswer, 'id'> | null, o2: Pick<IUserTestAnswer, 'id'> | null): boolean {
    return o1 && o2 ? this.getUserTestAnswerIdentifier(o1) === this.getUserTestAnswerIdentifier(o2) : o1 === o2;
  }

  addUserTestAnswerToCollectionIfMissing<Type extends Pick<IUserTestAnswer, 'id'>>(
    userTestAnswerCollection: Type[],
    ...userTestAnswersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const userTestAnswers: Type[] = userTestAnswersToCheck.filter(isPresent);
    if (userTestAnswers.length > 0) {
      const userTestAnswerCollectionIdentifiers = userTestAnswerCollection.map(userTestAnswerItem =>
        this.getUserTestAnswerIdentifier(userTestAnswerItem),
      );
      const userTestAnswersToAdd = userTestAnswers.filter(userTestAnswerItem => {
        const userTestAnswerIdentifier = this.getUserTestAnswerIdentifier(userTestAnswerItem);
        if (userTestAnswerCollectionIdentifiers.includes(userTestAnswerIdentifier)) {
          return false;
        }
        userTestAnswerCollectionIdentifiers.push(userTestAnswerIdentifier);
        return true;
      });
      return [...userTestAnswersToAdd, ...userTestAnswerCollection];
    }
    return userTestAnswerCollection;
  }

  protected convertDateFromClient<T extends IUserTestAnswer | NewUserTestAnswer | PartialUpdateUserTestAnswer>(
    userTestAnswer: T,
  ): RestOf<T> {
    return {
      ...userTestAnswer,
      timestamp: userTestAnswer.timestamp?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restUserTestAnswer: RestUserTestAnswer): IUserTestAnswer {
    return {
      ...restUserTestAnswer,
      timestamp: restUserTestAnswer.timestamp ? dayjs(restUserTestAnswer.timestamp) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestUserTestAnswer>): HttpResponse<IUserTestAnswer> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestUserTestAnswer[]>): HttpResponse<IUserTestAnswer[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
