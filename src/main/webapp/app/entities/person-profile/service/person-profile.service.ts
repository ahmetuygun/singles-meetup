import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPersonProfile, NewPersonProfile } from '../person-profile.model';

export type PartialUpdatePersonProfile = Partial<IPersonProfile> & Pick<IPersonProfile, 'id'>;

type RestOf<T extends IPersonProfile | NewPersonProfile> = Omit<T, 'dob'> & {
  dob?: string | null;
};

export type RestPersonProfile = RestOf<IPersonProfile>;

export type NewRestPersonProfile = RestOf<NewPersonProfile>;

export type PartialUpdateRestPersonProfile = RestOf<PartialUpdatePersonProfile>;

export type EntityResponseType = HttpResponse<IPersonProfile>;
export type EntityArrayResponseType = HttpResponse<IPersonProfile[]>;

@Injectable({ providedIn: 'root' })
export class PersonProfileService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/person-profiles');

  create(personProfile: NewPersonProfile): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(personProfile);
    return this.http
      .post<RestPersonProfile>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(personProfile: IPersonProfile): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(personProfile);
    return this.http
      .put<RestPersonProfile>(`${this.resourceUrl}/${this.getPersonProfileIdentifier(personProfile)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(personProfile: PartialUpdatePersonProfile): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(personProfile);
    return this.http
      .patch<RestPersonProfile>(`${this.resourceUrl}/${this.getPersonProfileIdentifier(personProfile)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestPersonProfile>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPersonProfile[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPersonProfileIdentifier(personProfile: Pick<IPersonProfile, 'id'>): number {
    return personProfile.id;
  }

  comparePersonProfile(o1: Pick<IPersonProfile, 'id'> | null, o2: Pick<IPersonProfile, 'id'> | null): boolean {
    return o1 && o2 ? this.getPersonProfileIdentifier(o1) === this.getPersonProfileIdentifier(o2) : o1 === o2;
  }

  addPersonProfileToCollectionIfMissing<Type extends Pick<IPersonProfile, 'id'>>(
    personProfileCollection: Type[],
    ...personProfilesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const personProfiles: Type[] = personProfilesToCheck.filter(isPresent);
    if (personProfiles.length > 0) {
      const personProfileCollectionIdentifiers = personProfileCollection.map(personProfileItem =>
        this.getPersonProfileIdentifier(personProfileItem),
      );
      const personProfilesToAdd = personProfiles.filter(personProfileItem => {
        const personProfileIdentifier = this.getPersonProfileIdentifier(personProfileItem);
        if (personProfileCollectionIdentifiers.includes(personProfileIdentifier)) {
          return false;
        }
        personProfileCollectionIdentifiers.push(personProfileIdentifier);
        return true;
      });
      return [...personProfilesToAdd, ...personProfileCollection];
    }
    return personProfileCollection;
  }

  protected convertDateFromClient<T extends IPersonProfile | NewPersonProfile | PartialUpdatePersonProfile>(personProfile: T): RestOf<T> {
    return {
      ...personProfile,
      dob: personProfile.dob?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restPersonProfile: RestPersonProfile): IPersonProfile {
    return {
      ...restPersonProfile,
      dob: restPersonProfile.dob ? dayjs(restPersonProfile.dob) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPersonProfile>): HttpResponse<IPersonProfile> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPersonProfile[]>): HttpResponse<IPersonProfile[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
