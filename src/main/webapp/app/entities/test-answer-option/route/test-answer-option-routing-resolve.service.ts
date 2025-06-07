import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITestAnswerOption } from '../test-answer-option.model';
import { TestAnswerOptionService } from '../service/test-answer-option.service';

const testAnswerOptionResolve = (route: ActivatedRouteSnapshot): Observable<null | ITestAnswerOption> => {
  const id = route.params.id;
  if (id) {
    return inject(TestAnswerOptionService)
      .find(id)
      .pipe(
        mergeMap((testAnswerOption: HttpResponse<ITestAnswerOption>) => {
          if (testAnswerOption.body) {
            return of(testAnswerOption.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default testAnswerOptionResolve;
