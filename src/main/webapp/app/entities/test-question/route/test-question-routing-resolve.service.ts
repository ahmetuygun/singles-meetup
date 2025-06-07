import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITestQuestion } from '../test-question.model';
import { TestQuestionService } from '../service/test-question.service';

const testQuestionResolve = (route: ActivatedRouteSnapshot): Observable<null | ITestQuestion> => {
  const id = route.params.id;
  if (id) {
    return inject(TestQuestionService)
      .find(id)
      .pipe(
        mergeMap((testQuestion: HttpResponse<ITestQuestion>) => {
          if (testQuestion.body) {
            return of(testQuestion.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default testQuestionResolve;
