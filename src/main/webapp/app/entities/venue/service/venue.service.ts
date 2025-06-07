import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IVenue, NewVenue } from '../venue.model';

export type PartialUpdateVenue = Partial<IVenue> & Pick<IVenue, 'id'>;

export type EntityResponseType = HttpResponse<IVenue>;
export type EntityArrayResponseType = HttpResponse<IVenue[]>;

@Injectable({ providedIn: 'root' })
export class VenueService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/venues');

  create(venue: NewVenue): Observable<EntityResponseType> {
    return this.http.post<IVenue>(this.resourceUrl, venue, { observe: 'response' });
  }

  update(venue: IVenue): Observable<EntityResponseType> {
    return this.http.put<IVenue>(`${this.resourceUrl}/${this.getVenueIdentifier(venue)}`, venue, { observe: 'response' });
  }

  partialUpdate(venue: PartialUpdateVenue): Observable<EntityResponseType> {
    return this.http.patch<IVenue>(`${this.resourceUrl}/${this.getVenueIdentifier(venue)}`, venue, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IVenue>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IVenue[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getVenueIdentifier(venue: Pick<IVenue, 'id'>): number {
    return venue.id;
  }

  compareVenue(o1: Pick<IVenue, 'id'> | null, o2: Pick<IVenue, 'id'> | null): boolean {
    return o1 && o2 ? this.getVenueIdentifier(o1) === this.getVenueIdentifier(o2) : o1 === o2;
  }

  addVenueToCollectionIfMissing<Type extends Pick<IVenue, 'id'>>(
    venueCollection: Type[],
    ...venuesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const venues: Type[] = venuesToCheck.filter(isPresent);
    if (venues.length > 0) {
      const venueCollectionIdentifiers = venueCollection.map(venueItem => this.getVenueIdentifier(venueItem));
      const venuesToAdd = venues.filter(venueItem => {
        const venueIdentifier = this.getVenueIdentifier(venueItem);
        if (venueCollectionIdentifiers.includes(venueIdentifier)) {
          return false;
        }
        venueCollectionIdentifiers.push(venueIdentifier);
        return true;
      });
      return [...venuesToAdd, ...venueCollection];
    }
    return venueCollection;
  }
}
