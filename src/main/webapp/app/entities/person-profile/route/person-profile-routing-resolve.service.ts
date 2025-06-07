import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPersonProfile } from '../person-profile.model';
import { PersonProfileService } from '../service/person-profile.service';

const personProfileResolve = (route: ActivatedRouteSnapshot): Observable<null | IPersonProfile> => {
  const id = route.params.id;
  if (id) {
    return inject(PersonProfileService)
      .find(id)
      .pipe(
        mergeMap((personProfile: HttpResponse<IPersonProfile>) => {
          if (personProfile.body) {
            return of(personProfile.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default personProfileResolve;
