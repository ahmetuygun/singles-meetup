import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IEvent, NewEvent } from '../event.model';

export type PartialUpdateEvent = Partial<IEvent> & Pick<IEvent, 'id'>;

type RestOf<T extends IEvent | NewEvent> = Omit<T, 'eventDate'> & {
  eventDate?: string | null;
};

export type RestEvent = RestOf<IEvent>;

export type NewRestEvent = RestOf<NewEvent>;

export type PartialUpdateRestEvent = RestOf<PartialUpdateEvent>;

export type EntityResponseType = HttpResponse<IEvent>;
export type EntityArrayResponseType = HttpResponse<IEvent[]>;

@Injectable({ providedIn: 'root' })
export class EventService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/events');

  create(event: NewEvent): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(event);
    return this.http.post<RestEvent>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(event: IEvent): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(event);
    return this.http
      .put<RestEvent>(`${this.resourceUrl}/${this.getEventIdentifier(event)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(event: PartialUpdateEvent): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(event);
    return this.http
      .patch<RestEvent>(`${this.resourceUrl}/${this.getEventIdentifier(event)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestEvent>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestEvent[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getEventIdentifier(event: Pick<IEvent, 'id'>): number {
    return event.id;
  }

  compareEvent(o1: Pick<IEvent, 'id'> | null, o2: Pick<IEvent, 'id'> | null): boolean {
    return o1 && o2 ? this.getEventIdentifier(o1) === this.getEventIdentifier(o2) : o1 === o2;
  }

  addEventToCollectionIfMissing<Type extends Pick<IEvent, 'id'>>(
    eventCollection: Type[],
    ...eventsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const events: Type[] = eventsToCheck.filter(isPresent);
    if (events.length > 0) {
      const eventCollectionIdentifiers = eventCollection.map(eventItem => this.getEventIdentifier(eventItem));
      const eventsToAdd = events.filter(eventItem => {
        const eventIdentifier = this.getEventIdentifier(eventItem);
        if (eventCollectionIdentifiers.includes(eventIdentifier)) {
          return false;
        }
        eventCollectionIdentifiers.push(eventIdentifier);
        return true;
      });
      return [...eventsToAdd, ...eventCollection];
    }
    return eventCollection;
  }

  protected convertDateFromClient<T extends IEvent | NewEvent | PartialUpdateEvent>(event: T): RestOf<T> {
    return {
      ...event,
      eventDate: event.eventDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restEvent: RestEvent): IEvent {
    return {
      ...restEvent,
      eventDate: restEvent.eventDate ? dayjs(restEvent.eventDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestEvent>): HttpResponse<IEvent> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestEvent[]>): HttpResponse<IEvent[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
