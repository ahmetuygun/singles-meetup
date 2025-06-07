import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import UserTestAnswerResolve from './route/user-test-answer-routing-resolve.service';

const userTestAnswerRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/user-test-answer.component').then(m => m.UserTestAnswerComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/user-test-answer-detail.component').then(m => m.UserTestAnswerDetailComponent),
    resolve: {
      userTestAnswer: UserTestAnswerResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/user-test-answer-update.component').then(m => m.UserTestAnswerUpdateComponent),
    resolve: {
      userTestAnswer: UserTestAnswerResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/user-test-answer-update.component').then(m => m.UserTestAnswerUpdateComponent),
    resolve: {
      userTestAnswer: UserTestAnswerResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default userTestAnswerRoute;
