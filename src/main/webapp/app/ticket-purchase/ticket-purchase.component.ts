import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { EventService } from '../entities/event/service/event.service';
import { IEvent } from '../entities/event/event.model';
import { TicketService } from '../entities/ticket/service/ticket.service';
import { ITicket } from '../entities/ticket/ticket.model';

export interface TicketSelection {
  ticket: ITicket;
  quantity: number;
}

@Component({
  selector: 'jhi-ticket-purchase',
  templateUrl: './ticket-purchase.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, RouterModule],
})
export class TicketPurchaseComponent implements OnInit {
  event = signal<IEvent | null>(null);
  tickets = signal<ITicket[]>([]);
  
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected eventService = inject(EventService);
  protected ticketService = inject(TicketService);

  selectedTickets = signal<TicketSelection[]>([]);
  isProcessing = signal<boolean>(false);

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.loadEvent(Number(eventId));
    }
  }

  loadEvent(eventId: number): void {
    this.eventService.find(eventId).subscribe({
      next: (response) => {
        this.event.set(response.body);
        this.loadTickets(eventId);
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }

  loadTickets(eventId: number): void {
    this.ticketService.getTicketsByEvent(eventId).subscribe({
      next: (response) => {
        this.tickets.set(response.body || []);
      },
      error: (error) => {
        // Error loading tickets
      }
    });
  }

  selectTicket(ticket: ITicket): void {
    const current = this.selectedTickets();
    const existing = current.find(t => t.ticket.id === ticket.id);
    
    if (existing) {
      // Remove if already selected
      this.selectedTickets.set(current.filter(t => t.ticket.id !== ticket.id));
    } else {
      // Add new selection
      this.selectedTickets.set([...current, { ticket, quantity: 1 }]);
    }
  }

  updateQuantity(ticketId: number, quantity: number): void {
    if (quantity < 1) return;
    
    const current = this.selectedTickets();
    const updated = current.map(selection => 
      selection.ticket.id === ticketId 
        ? { ...selection, quantity }
        : selection
    );
    this.selectedTickets.set(updated);
  }

  removeTicket(ticketId: number): void {
    const current = this.selectedTickets();
    this.selectedTickets.set(current.filter(t => t.ticket.id !== ticketId));
  }

  getTotalPrice(): number {
    return this.selectedTickets().reduce((total, selection) => 
      total + ((selection.ticket.price || 0) * selection.quantity), 0
    );
  }

  getTotalQuantity(): number {
    return this.selectedTickets().reduce((total, selection) => 
      total + selection.quantity, 0
    );
  }

  getBookingFeeForTicket(ticket: ITicket): number {
    // Use ticket's booking fee or default to 10% of ticket price if not set
    return ticket.bookingFee || (ticket.price || 0) * 0.1;
  }

  onQuantityChange(ticket: ITicket, event: any): void {
    const quantity = parseInt(event.target.value, 10);
    
    if (quantity === 0) {
      // Remove ticket if quantity is 0
      this.selectedTickets.update(tickets => 
        tickets.filter(t => t.ticket.id !== ticket.id)
      );
    } else {
      const existingIndex = this.selectedTickets().findIndex(t => t.ticket.id === ticket.id);
      
      if (existingIndex >= 0) {
        // Update existing ticket quantity
        this.selectedTickets.update(tickets => 
          tickets.map(t => 
            t.ticket.id === ticket.id 
              ? { ...t, quantity }
              : t
          )
        );
      } else {
        // Add new ticket with quantity
        this.selectedTickets.update(tickets => [...tickets, { ticket, quantity }]);
      }
    }
  }

  completePurchase(): void {
    if (this.getTotalQuantity() === 0) return;
    
    // Navigate to payment page with selected tickets
    const eventId = this.event()?.id;
    if (eventId) {
      this.router.navigate(['/event', eventId, 'payment'], {
        state: { 
          selectedTickets: this.selectedTickets(),
          event: this.event()
        }
      });
    }
  }

  isTicketSelected(ticketId: number): boolean {
    return this.selectedTickets().some(t => t.ticket.id === ticketId);
  }

  getSelectedTicket(ticketId: number): TicketSelection | undefined {
    return this.selectedTickets().find(t => t.ticket.id === ticketId);
  }

  getTicketColor(ticket: ITicket): string {
    if (ticket.genderRestriction === 'MALE') {
      return 'primary';
    } else if (ticket.genderRestriction === 'FEMALE') {
      return 'danger';
    }
    return 'secondary';
  }

  goBack(): void {
    const eventId = this.event()?.id;
    if (eventId) {
      this.router.navigate(['/event', eventId, 'view']);
    } else {
      this.router.navigate(['/']);
    }
  }
} 