import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IUserTicket, NewUserTicket } from '../user-ticket.model';

export type PartialUpdateUserTicket = Partial<IUserTicket> & Pick<IUserTicket, 'id'>;

type RestOf<T extends IUserTicket | NewUserTicket> = Omit<T, 'purchaseDate'> & {
  purchaseDate?: string | null;
};

export type RestUserTicket = RestOf<IUserTicket>;

export type NewRestUserTicket = RestOf<NewUserTicket>;

export type PartialUpdateRestUserTicket = RestOf<PartialUpdateUserTicket>;

export type EntityResponseType = HttpResponse<IUserTicket>;
export type EntityArrayResponseType = HttpResponse<IUserTicket[]>;

export interface PurchaseRequest {
  ticketSelections: TicketSelection[];
  paymentMethod: string;
  stripePaymentIntentId?: string; // Optional for Stripe payments
}

export interface TicketSelection {
  ticketId: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class UserTicketService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/user-tickets');

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
  ) {}

  purchaseTickets(purchaseRequest: PurchaseRequest): Observable<EntityArrayResponseType> {
    return this.http
      .post<RestUserTicket[]>(`${this.resourceUrl}/purchase`, purchaseRequest, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  getMyTickets(): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestUserTicket[]>(`${this.resourceUrl}/my-tickets`, { observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestUserTicket>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestUserTicket[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  getUserTicketIdentifier(userTicket: Pick<IUserTicket, 'id'>): number {
    return userTicket.id;
  }

  compareUserTicket(o1: Pick<IUserTicket, 'id'> | null, o2: Pick<IUserTicket, 'id'> | null): boolean {
    return o1 && o2 ? this.getUserTicketIdentifier(o1) === this.getUserTicketIdentifier(o2) : o1 === o2;
  }

  addUserTicketToCollectionIfMissing<Type extends Pick<IUserTicket, 'id'>>(
    userTicketCollection: Type[],
    ...userTicketsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const userTickets: Type[] = userTicketsToCheck.filter(isPresent);
    if (userTickets.length > 0) {
      const userTicketCollectionIdentifiers = userTicketCollection.map(userTicketItem => this.getUserTicketIdentifier(userTicketItem)!);
      const userTicketsToAdd = userTickets.filter(userTicketItem => {
        const userTicketIdentifier = this.getUserTicketIdentifier(userTicketItem);
        if (userTicketCollectionIdentifiers.includes(userTicketIdentifier)) {
          return false;
        }
        userTicketCollectionIdentifiers.push(userTicketIdentifier);
        return true;
      });
      return [...userTicketCollection, ...userTicketsToAdd];
    }
    return userTicketCollection;
  }

  protected convertDateFromClient<T extends IUserTicket | NewUserTicket | PartialUpdateUserTicket>(userTicket: T): RestOf<T> {
    return {
      ...userTicket,
      purchaseDate: userTicket.purchaseDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restUserTicket: RestUserTicket): IUserTicket {
    return {
      ...restUserTicket,
      purchaseDate: restUserTicket.purchaseDate ? dayjs(restUserTicket.purchaseDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestUserTicket>): HttpResponse<IUserTicket> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestUserTicket[]>): HttpResponse<IUserTicket[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
} 