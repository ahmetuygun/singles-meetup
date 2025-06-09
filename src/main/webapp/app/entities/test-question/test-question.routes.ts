import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import TestQuestionResolve from './route/test-question-routing-resolve.service';

const testQuestionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./question-manager/question-manager.component').then(m => m.QuestionManagerComponent),
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'old-list',
    loadComponent: () => import('./list/test-question.component').then(m => m.TestQuestionComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/test-question-detail.component').then(m => m.TestQuestionDetailComponent),
    resolve: {
      testQuestion: TestQuestionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/test-question-update.component').then(m => m.TestQuestionUpdateComponent),
    resolve: {
      testQuestion: TestQuestionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/test-question-update.component').then(m => m.TestQuestionUpdateComponent),
    resolve: {
      testQuestion: TestQuestionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default testQuestionRoute;
