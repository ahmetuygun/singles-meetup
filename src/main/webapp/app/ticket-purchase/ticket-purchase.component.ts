import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { EventService } from '../entities/event/service/event.service';
import { IEvent } from '../entities/event/event.model';

export interface TicketType {
  id: string;
  name: string;
  price: number;
  icon: string;
  color: string;
}

export interface TicketSelection {
  ticketType: TicketType;
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
  
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected eventService = inject(EventService);
  
  ticketTypes: TicketType[] = [
    {
      id: 'male-early',
      name: 'Male Early Bird Ticket',
      price: 12.00,
      icon: 'user',
      color: 'primary'
    },
    {
      id: 'female-early',
      name: 'Female Early Bird Ticket', 
      price: 12.00,
      icon: 'user',
      color: 'danger'
    },
    {
      id: 'male-general',
      name: 'Male General Admission Ticket',
      price: 15.00,
      icon: 'user',
      color: 'primary'
    },
    {
      id: 'female-general',
      name: 'Female General Admission Ticket', 
      price: 15.00,
      icon: 'user',
      color: 'danger'
    }
  ];

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
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }

  selectTicket(ticketType: TicketType): void {
    const current = this.selectedTickets();
    const existing = current.find(t => t.ticketType.id === ticketType.id);
    
    if (existing) {
      // Remove if already selected
      this.selectedTickets.set(current.filter(t => t.ticketType.id !== ticketType.id));
    } else {
      // Add new selection
      this.selectedTickets.set([...current, { ticketType, quantity: 1 }]);
    }
  }

  updateQuantity(ticketTypeId: string, quantity: number): void {
    if (quantity < 1) return;
    
    const current = this.selectedTickets();
    const updated = current.map(selection => 
      selection.ticketType.id === ticketTypeId 
        ? { ...selection, quantity }
        : selection
    );
    this.selectedTickets.set(updated);
  }

  removeTicket(ticketTypeId: string): void {
    const current = this.selectedTickets();
    this.selectedTickets.set(current.filter(t => t.ticketType.id !== ticketTypeId));
  }

  getTotalPrice(): number {
    return this.selectedTickets().reduce((total, selection) => 
      total + (selection.ticketType.price * selection.quantity), 0
    );
  }

  getTotalQuantity(): number {
    return this.selectedTickets().reduce((total, selection) => 
      total + selection.quantity, 0
    );
  }

  onQuantityChange(ticketType: TicketType, event: any): void {
    const quantity = parseInt(event.target.value, 10);
    
    if (quantity === 0) {
      // Remove ticket if quantity is 0
      this.selectedTickets.update(tickets => 
        tickets.filter(t => t.ticketType.id !== ticketType.id)
      );
    } else {
      const existingIndex = this.selectedTickets().findIndex(t => t.ticketType.id === ticketType.id);
      
      if (existingIndex >= 0) {
        // Update existing ticket quantity
        this.selectedTickets.update(tickets => 
          tickets.map(t => 
            t.ticketType.id === ticketType.id 
              ? { ...t, quantity }
              : t
          )
        );
      } else {
        // Add new ticket with quantity
        this.selectedTickets.update(tickets => [...tickets, { ticketType, quantity }]);
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

  isTicketSelected(ticketTypeId: string): boolean {
    return this.selectedTickets().some(t => t.ticketType.id === ticketTypeId);
  }

  getSelectedTicket(ticketTypeId: string): TicketSelection | undefined {
    return this.selectedTickets().find(t => t.ticketType.id === ticketTypeId);
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