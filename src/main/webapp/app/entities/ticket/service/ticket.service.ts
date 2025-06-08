import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITicket, NewTicket } from '../ticket.model';

export type PartialUpdateTicket = Partial<ITicket> & Pick<ITicket, 'id'>;

export type EntityResponseType = HttpResponse<ITicket>;
export type EntityArrayResponseType = HttpResponse<ITicket[]>;

@Injectable({ providedIn: 'root' })
export class TicketService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/tickets');

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
  ) {}

  create(ticket: NewTicket): Observable<EntityResponseType> {
    return this.http.post<ITicket>(this.resourceUrl, ticket, { observe: 'response' });
  }

  update(ticket: ITicket): Observable<EntityResponseType> {
    return this.http.put<ITicket>(`${this.resourceUrl}/${this.getTicketIdentifier(ticket)}`, ticket, { observe: 'response' });
  }

  partialUpdate(ticket: PartialUpdateTicket): Observable<EntityResponseType> {
    return this.http.patch<ITicket>(`${this.resourceUrl}/${this.getTicketIdentifier(ticket)}`, ticket, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITicket>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITicket[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  getTicketsByEvent(eventId: number): Observable<EntityArrayResponseType> {
    return this.http.get<ITicket[]>(`${this.resourceUrl}/event/${eventId}`, { observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTicketIdentifier(ticket: Pick<ITicket, 'id'>): number {
    return ticket.id;
  }

  compareTicket(o1: Pick<ITicket, 'id'> | null, o2: Pick<ITicket, 'id'> | null): boolean {
    return o1 && o2 ? this.getTicketIdentifier(o1) === this.getTicketIdentifier(o2) : o1 === o2;
  }

  addTicketToCollectionIfMissing<Type extends Pick<ITicket, 'id'>>(
    ticketCollection: Type[],
    ...ticketsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const tickets: Type[] = ticketsToCheck.filter(isPresent);
    if (tickets.length > 0) {
      const ticketCollectionIdentifiers = ticketCollection.map(ticketItem => this.getTicketIdentifier(ticketItem)!);
      const ticketsToAdd = tickets.filter(ticketItem => {
        const ticketIdentifier = this.getTicketIdentifier(ticketItem);
        if (ticketCollectionIdentifiers.includes(ticketIdentifier)) {
          return false;
        }
        ticketCollectionIdentifiers.push(ticketIdentifier);
        return true;
      });
      return [...ticketCollection, ...ticketsToAdd];
    }
    return ticketCollection;
  }
} 