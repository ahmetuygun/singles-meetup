import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IUserEvent } from '../user-event.model';
import { UserEventService } from '../service/user-event.service';

const userEventResolve = (route: ActivatedRouteSnapshot): Observable<null | IUserEvent> => {
  const id = route.params.id;
  if (id) {
    return inject(UserEventService)
      .find(id)
      .pipe(
        mergeMap((userEvent: HttpResponse<IUserEvent>) => {
          if (userEvent.body) {
            return of(userEvent.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default userEventResolve;
