import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import SharedModule from 'app/shared/shared.module';
import { UserTicketService } from '../entities/user-ticket/service/user-ticket.service';
import { IUserTicket } from '../entities/user-ticket/user-ticket.model';
import { IUserEvent } from '../entities/user-event/user-event.model';
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
      
      // Create a modal-like popup with the QR code
      const popup = window.open('', '_blank', 'width=400,height=500,scrollbars=no,resizable=no');
      if (popup) {
        popup.document.write(`
          <html>
            <head>
              <title>QR Code - ${eventName}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 20px; 
                  margin: 0;
                  background: #f8f9fa;
                }
                .container {
                  background: white;
                  border-radius: 12px;
                  padding: 30px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  margin: 20px auto;
                  max-width: 320px;
                }
                h2 { 
                  color: #333; 
                  margin-bottom: 10px; 
                  font-size: 18px;
                }
                .event-name { 
                  color: #666; 
                  margin-bottom: 20px; 
                  font-size: 14px;
                }
                .qr-code { 
                  margin: 20px 0; 
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  overflow: hidden;
                }
                .ticket-code { 
                  font-family: monospace; 
                  background: #f8f9fa; 
                  padding: 10px; 
                  border-radius: 6px; 
                  margin: 15px 0;
                  font-size: 12px;
                  color: #666;
                }
                .close-btn {
                  background: #6c757d;
                  color: white;
                  border: none;
                  padding: 8px 20px;
                  border-radius: 6px;
                  cursor: pointer;
                  margin-top: 15px;
                }
                .close-btn:hover {
                  background: #5a6268;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Entry QR Code</h2>
                <div class="event-name">${eventName}</div>
                <div class="qr-code">
                  <img src="${qrCode}" alt="QR Code" style="width: 250px; height: 250px; display: block;" />
                </div>
                <div class="ticket-code">Ticket: ${ticketCode}</div>
                <button class="close-btn" onclick="window.close()">Close</button>
              </div>
            </body>
          </html>
        `);
        popup.document.close();
      }
    } else {
      alert('QR code not available for this ticket.');
    }
  }
} 