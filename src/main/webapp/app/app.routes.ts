import { Routes } from '@angular/router';

import { Authority } from 'app/config/authority.constants';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { errorRoute } from './layouts/error/error.route';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component'),
    title: 'home.title',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar.component'),
    outlet: 'navbar',
  },
  {
    path: 'admin',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: '',
    loadChildren: () => import(`./entities/entity.routes`),
  },
  {
    path: 'landing',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'questionnaire',
    loadComponent: () => import('./test-questionnaire/test-questionnaire.component').then(m => m.TestQuestionnaireComponent)
  },
  {
    path: 'questionnaire-success',
    loadComponent: () => import('./questionnaire-success/questionnaire-success.component').then(m => m.QuestionnaireSuccessComponent)
  },
  {
    path: 'event/:eventId/tickets',
    loadComponent: () => import('./ticket-purchase/ticket-purchase.component').then(m => m.TicketPurchaseComponent),
    title: 'Purchase Tickets',
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'event/:eventId/payment',
    loadComponent: () => import('./payment/payment.component').then(m => m.PaymentComponent),
    title: 'Payment',
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'my-tickets',
    loadComponent: () => import('./my-tickets/my-tickets.component').then(m => m.MyTicketsComponent),
    title: 'My Tickets',
    canActivate: [UserRouteAccessService]
  },
  ...errorRoute,
];

export default routes;
