import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { UserTicketService } from '../entities/user-ticket/service/user-ticket.service';
import { IUserTicket } from '../entities/user-ticket/user-ticket.model';
import dayjs from 'dayjs/esm';

@Component({
  selector: 'jhi-my-tickets',
  templateUrl: './my-tickets.component.html',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
})
export class MyTicketsComponent implements OnInit {
  protected userTicketService = inject(UserTicketService);
  
  userTickets = signal<IUserTicket[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadMyTickets();
  }

  loadMyTickets(): void {
    this.isLoading.set(true);
    this.userTicketService.getMyTickets().subscribe({
      next: (response) => {
        this.userTickets.set(response.body || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.isLoading.set(false);
      }
    });
  }

  formatDate(date: dayjs.Dayjs | null | undefined): string {
    if (!date) return '';
    return date.format('MMM DD, YYYY [at] HH:mm');
  }

  getEventName(userTicket: IUserTicket): string {
    console.log('UserTicket data:', userTicket);
    console.log('Ticket data:', userTicket.ticket);
    console.log('Event data:', userTicket.ticket?.event);
    return userTicket.ticket?.event?.name || 'Unknown Event';
  }

  getTicketTypeName(userTicket: IUserTicket): string {
    return userTicket.ticket?.name || 'Unknown Ticket';
  }

  getShortTicketCode(userTicket: IUserTicket): string {
    const code = userTicket.ticketCode;
    if (!code) return 'N/A';
    // Show first 8 characters in uppercase
    return code.substring(0, 8).toUpperCase();
  }

  getTicketPrice(userTicket: IUserTicket): number {
    return userTicket.ticket?.price || 0;
  }

  getTotalWithFees(userTicket: IUserTicket): number {
    return (userTicket.totalPrice || 0) + (userTicket.bookingFee || 0);
  }

  getPaymentStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'PAID':
        return 'badge bg-success';
      case 'PENDING':
        return 'badge bg-warning';
      case 'UNPAID':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
} 