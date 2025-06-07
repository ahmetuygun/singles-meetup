import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import PersonProfileResolve from './route/person-profile-routing-resolve.service';

const personProfileRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/person-profile.component').then(m => m.PersonProfileComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/person-profile-detail.component').then(m => m.PersonProfileDetailComponent),
    resolve: {
      personProfile: PersonProfileResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/person-profile-update.component').then(m => m.PersonProfileUpdateComponent),
    resolve: {
      personProfile: PersonProfileResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/person-profile-update.component').then(m => m.PersonProfileUpdateComponent),
    resolve: {
      personProfile: PersonProfileResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default personProfileRoute;
