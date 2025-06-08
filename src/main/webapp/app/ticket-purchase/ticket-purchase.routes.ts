import { Routes } from '@angular/router';
import { TicketPurchaseComponent } from './ticket-purchase.component';

export const ticketPurchaseRoutes: Routes = [
  {
    path: 'event/:eventId/tickets',
    component: TicketPurchaseComponent,
    title: 'Purchase Tickets',
  },
]; 