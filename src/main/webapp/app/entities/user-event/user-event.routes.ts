import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import UserEventResolve from './route/user-event-routing-resolve.service';

const userEventRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/user-event.component').then(m => m.UserEventComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/user-event-detail.component').then(m => m.UserEventDetailComponent),
    resolve: {
      userEvent: UserEventResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/user-event-update.component').then(m => m.UserEventUpdateComponent),
    resolve: {
      userEvent: UserEventResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/user-event-update.component').then(m => m.UserEventUpdateComponent),
    resolve: {
      userEvent: UserEventResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default userEventRoute;
