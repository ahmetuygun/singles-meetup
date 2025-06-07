import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IUserTestAnswer } from '../user-test-answer.model';
import { UserTestAnswerService } from '../service/user-test-answer.service';

const userTestAnswerResolve = (route: ActivatedRouteSnapshot): Observable<null | IUserTestAnswer> => {
  const id = route.params.id;
  if (id) {
    return inject(UserTestAnswerService)
      .find(id)
      .pipe(
        mergeMap((userTestAnswer: HttpResponse<IUserTestAnswer>) => {
          if (userTestAnswer.body) {
            return of(userTestAnswer.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default userTestAnswerResolve;
