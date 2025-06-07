import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IVenue } from '../venue.model';
import { VenueService } from '../service/venue.service';

const venueResolve = (route: ActivatedRouteSnapshot): Observable<null | IVenue> => {
  const id = route.params.id;
  if (id) {
    return inject(VenueService)
      .find(id)
      .pipe(
        mergeMap((venue: HttpResponse<IVenue>) => {
          if (venue.body) {
            return of(venue.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default venueResolve;
