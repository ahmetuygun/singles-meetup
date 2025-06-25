import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import SharedModule from 'app/shared/shared.module';
import { UserTicketService } from '../entities/user-ticket/service/user-ticket.service';
import { IUserTicket } from '../entities/user-ticket/user-ticket.model';
import { IUserEvent } from '../entities/user-event/user-event.model';
import { QrCodeModalComponent } from './qr-code-modal/qr-code-modal.component';
import dayjs from 'dayjs/esm';

@Component({
  selector: 'jhi-my-tickets',
  templateUrl: './my-tickets.component.html',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
})
export class MyTicketsComponent implements OnInit {
  protected userTicketService = inject(UserTicketService);
  protected router = inject(Router);
  protected http = inject(HttpClient);
  protected modalService = inject(NgbModal);
  
  userTickets = signal<IUserTicket[]>([]);
  userEvents = signal<IUserEvent[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadMyTickets();
    this.loadMyUserEvents();
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

  loadMyUserEvents(): void {
    this.http.get<IUserEvent[]>('/api/user-events').subscribe({
      next: (userEvents) => {
        this.userEvents.set(userEvents);
      },
      error: (error) => {
        console.error('Error loading user events:', error);
      }
    });
  }

  formatDate(date: dayjs.Dayjs | null | undefined): string {
    if (!date) return '';
    return date.format('MMM DD, YYYY [at] HH:mm');
  }

  getEventName(userTicket: IUserTicket): string {
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

  navigateToEvent(userTicket: IUserTicket): void {
    const eventId = userTicket.ticket?.event?.id;
    if (eventId) {
      this.router.navigate(['/event', eventId, 'view']);
    }
  }

  getQrCodeForTicket(userTicket: IUserTicket): string | undefined {
    const eventId = userTicket.ticket?.event?.id;
    if (!eventId) return undefined;
    
    const userEvent = this.userEvents().find(ue => ue.event?.id === eventId);
    return userEvent?.qrCode || undefined;
  }

  showQrCode(userTicket: IUserTicket): void {
    const qrCode = this.getQrCodeForTicket(userTicket);
    if (qrCode) {
      const eventName = this.getEventName(userTicket);
      const ticketCode = this.getShortTicketCode(userTicket);
      
      const modalRef = this.modalService.open(QrCodeModalComponent, { 
        size: 'md', 
        backdrop: 'static',
        centered: true 
      });
      
      modalRef.componentInstance.qrCode = qrCode;
      modalRef.componentInstance.eventName = eventName;
      modalRef.componentInstance.ticketCode = ticketCode;
    } else {
      alert('QR code not available for this ticket.');
    }
  }
} 