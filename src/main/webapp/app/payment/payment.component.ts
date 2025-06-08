import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { IEvent } from '../entities/event/event.model';
import { TicketSelection } from '../ticket-purchase/ticket-purchase.component';

@Component({
  selector: 'jhi-payment',
  templateUrl: './payment.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
})
export class PaymentComponent implements OnInit {
  protected router = inject(Router);
  
  event = signal<IEvent | null>(null);
  selectedTickets = signal<TicketSelection[]>([]);
  selectedPaymentMethod = signal<string>('card');
  isProcessing = signal<boolean>(false);
  
  // Card form fields
  cardNumber = signal<string>('');
  cardName = signal<string>('');
  expiryDate = signal<string>('');
  securityCode = signal<string>('');
  saveCard = signal<boolean>(true);

  ngOnInit(): void {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    
    if (state?.selectedTickets && state?.event) {
      this.selectedTickets.set(state.selectedTickets);
      this.event.set(state.event);
    } else {
      // If no state, redirect back
      this.router.navigate(['/']);
    }
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod.set(method);
  }

  getTotalPrice(): number {
    return this.selectedTickets().reduce((total, selection) => 
      total + (selection.ticketType.price * selection.quantity), 0
    );
  }

  getBookingFees(): number {
    // 10% booking fee on the total ticket price
    return this.getTotalPrice() * 0.1;
  }

  getTotalWithFees(): number {
    return this.getTotalPrice() + this.getBookingFees();
  }

  formatCardNumber(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      this.cardNumber.set(parts.join(' '));
    } else {
      this.cardNumber.set('');
    }
  }

  formatExpiryDate(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.expiryDate.set(value);
  }

  processPurchase(): void {
    if (this.selectedPaymentMethod() === 'apple') {
      // Handle Apple Pay
      this.isProcessing.set(true);
      setTimeout(() => {
        this.completePurchase();
      }, 2000);
    } else {
      // Handle card payment
      if (this.validateCardForm()) {
        this.isProcessing.set(true);
        setTimeout(() => {
          this.completePurchase();
        }, 2000);
      }
    }
  }

  validateCardForm(): boolean {
    return this.cardNumber().length > 0 && 
           this.cardName().length > 0 && 
           this.expiryDate().length > 0 && 
           this.securityCode().length > 0;
  }

  getButtonDisabled(): boolean {
    return this.isProcessing() || (this.selectedPaymentMethod() === 'card' && !this.validateCardForm());
  }

  onSaveCardChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.saveCard.set(target.checked);
  }

  onCardNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.cardName.set(target.value);
  }

  onSecurityCodeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.securityCode.set(target.value);
  }

  completePurchase(): void {
    console.log('Purchase completed:', {
      tickets: this.selectedTickets(),
      paymentMethod: this.selectedPaymentMethod(),
      total: this.getTotalPrice()
    });
    
    this.isProcessing.set(false);
    alert('Payment processed successfully!');
    this.router.navigate(['/']);
  }

  goBack(): void {
    const eventId = this.event()?.id;
    if (eventId) {
      this.router.navigate(['/event', eventId, 'tickets']);
    } else {
      this.router.navigate(['/']);
    }
  }
} 