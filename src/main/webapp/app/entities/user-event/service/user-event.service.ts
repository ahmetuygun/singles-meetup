import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IUserEvent, NewUserEvent } from '../user-event.model';

export type PartialUpdateUserEvent = Partial<IUserEvent> & Pick<IUserEvent, 'id'>;

export type EntityResponseType = HttpResponse<IUserEvent>;
export type EntityArrayResponseType = HttpResponse<IUserEvent[]>;

@Injectable({ providedIn: 'root' })
export class UserEventService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/user-events');

  create(userEvent: NewUserEvent): Observable<EntityResponseType> {
    return this.http.post<IUserEvent>(this.resourceUrl, userEvent, { observe: 'response' });
  }

  update(userEvent: IUserEvent): Observable<EntityResponseType> {
    return this.http.put<IUserEvent>(`${this.resourceUrl}/${this.getUserEventIdentifier(userEvent)}`, userEvent, { observe: 'response' });
  }

  partialUpdate(userEvent: PartialUpdateUserEvent): Observable<EntityResponseType> {
    return this.http.patch<IUserEvent>(`${this.resourceUrl}/${this.getUserEventIdentifier(userEvent)}`, userEvent, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IUserEvent>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IUserEvent[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getUserEventIdentifier(userEvent: Pick<IUserEvent, 'id'>): number {
    return userEvent.id;
  }

  compareUserEvent(o1: Pick<IUserEvent, 'id'> | null, o2: Pick<IUserEvent, 'id'> | null): boolean {
    return o1 && o2 ? this.getUserEventIdentifier(o1) === this.getUserEventIdentifier(o2) : o1 === o2;
  }

  addUserEventToCollectionIfMissing<Type extends Pick<IUserEvent, 'id'>>(
    userEventCollection: Type[],
    ...userEventsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const userEvents: Type[] = userEventsToCheck.filter(isPresent);
    if (userEvents.length > 0) {
      const userEventCollectionIdentifiers = userEventCollection.map(userEventItem => this.getUserEventIdentifier(userEventItem));
      const userEventsToAdd = userEvents.filter(userEventItem => {
        const userEventIdentifier = this.getUserEventIdentifier(userEventItem);
        if (userEventCollectionIdentifiers.includes(userEventIdentifier)) {
          return false;
        }
        userEventCollectionIdentifiers.push(userEventIdentifier);
        return true;
      });
      return [...userEventsToAdd, ...userEventCollection];
    }
    return userEventCollection;
  }
}
