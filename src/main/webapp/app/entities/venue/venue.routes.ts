import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import VenueResolve from './route/venue-routing-resolve.service';

const venueRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/venue.component').then(m => m.VenueComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/venue-detail.component').then(m => m.VenueDetailComponent),
    resolve: {
      venue: VenueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/venue-update.component').then(m => m.VenueUpdateComponent),
    resolve: {
      venue: VenueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/venue-update.component').then(m => m.VenueUpdateComponent),
    resolve: {
      venue: VenueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default venueRoute;
