import { Component, inject, signal, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import SharedModule from 'app/shared/shared.module';
import { IEvent } from '../entities/event/event.model';
import { TicketSelection } from '../ticket-purchase/ticket-purchase.component';
import { UserTicketService, PurchaseRequest } from '../entities/user-ticket/service/user-ticket.service';
import { StripeService } from '../shared/services/stripe.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'jhi-payment',
  templateUrl: './payment.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
})
export class PaymentComponent implements OnInit, OnDestroy, AfterViewInit {
  protected router = inject(Router);
  protected userTicketService = inject(UserTicketService);
  protected stripeService = inject(StripeService);
  protected http = inject(HttpClient);
  
  event = signal<IEvent | null>(null);
  selectedTickets = signal<TicketSelection[]>([]);
  selectedPaymentMethod = signal<string>('card');
  isProcessing = signal<boolean>(false);
  
  // Card form fields (for display only - Stripe handles the actual input)
  cardNumber = signal<string>('');
  cardName = signal<string>('');
  expiryDate = signal<string>('');
  securityCode = signal<string>('');
  saveCard = signal<boolean>(true);
  
  // Stripe-specific properties
  isStripeInitialized = signal<boolean>(false);
  applePayAvailable = signal<boolean>(false);
  googlePayAvailable = signal<boolean>(false);
  stripeCardElementMounted = signal<boolean>(false);
  
  // Error handling
  errorMessage = signal<string>('');

  private readonly maxPaymentAttempts = 3;
  private paymentAttempts = 0;
  private lastPaymentAttemptTime = 0;
  private readonly paymentCooldownMs = 10000; // 10 seconds between attempts

  ngOnInit(): void {
    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    
    if (state?.selectedTickets && state?.event) {
      this.selectedTickets.set(state.selectedTickets);
      this.event.set(state.event);
      this.initializeStripe();
    } else {
      // If no state, redirect back
      this.router.navigate(['/']);
    }
    this.checkPaymentAttemptLimits();
  }

  ngAfterViewInit(): void {
    // This will be called after the view is initialized
    // We'll mount the Stripe card element here if needed
    if (this.isStripeInitialized() && this.selectedPaymentMethod() === 'card') {
      setTimeout(() => this.mountStripeCardElement(), 100);
    }
  }

  ngOnDestroy(): void {
    // Clean up Stripe elements
    this.stripeService.destroy();
  }

  async initializeStripe(): Promise<void> {
    try {
      await this.stripeService.initializeStripe();
      this.isStripeInitialized.set(true);
      
      // Check if Apple Pay / Google Pay is available
      const paymentRequest = await this.stripeService.createPaymentRequest(this.getTotalWithFees());
      if (paymentRequest) {
        const result = await paymentRequest.canMakePayment();
        if (result) {
          this.applePayAvailable.set(result.applePay || false);
          this.googlePayAvailable.set(result.googlePay || false);
        }
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }

  async mountStripeCardElement(): Promise<void> {
    if (!this.stripeCardElementMounted()) {
      try {
        await this.stripeService.createCardElement('stripe-card-element');
        this.stripeCardElementMounted.set(true);
      } catch (error) {
        console.error('Failed to mount Stripe card element:', error);
      }
    }
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod.set(method);
    
    // Mount card element when card payment is selected
    if (method === 'card' && this.isStripeInitialized() && !this.stripeCardElementMounted()) {
      setTimeout(() => this.mountStripeCardElement(), 100);
    }
  }

  getTotalPrice(): number {
    return this.selectedTickets().reduce((total, selection) => 
      total + ((selection.ticket.price || 0) * selection.quantity), 0
    );
  }

  getBookingFees(): number {
    return this.selectedTickets().reduce((total, selection) => {
      const ticketBookingFee = selection.ticket.bookingFee || (selection.ticket.price || 0) * 0.1; // Default 10% if not set
      return total + (ticketBookingFee * selection.quantity);
    }, 0);
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

  async completePurchase(): Promise<void> {
    try {
      this.isProcessing.set(true);

      // Step 1: Create payment intent on backend
      const paymentIntentData = {
        amount: Math.round(this.getTotalWithFees() * 100), // Convert to cents
        currency: 'eur',
        ticketSelections: this.selectedTickets().map(selection => ({
          ticketId: selection.ticket.id,
          quantity: selection.quantity
        })),
        paymentMethod: this.selectedPaymentMethod()
      };

      const paymentIntentResponse = await this.http.post<any>('/api/payments/create-intent', paymentIntentData).toPromise();
      const clientSecret = paymentIntentResponse.clientSecret;

      // Step 2: Process payment based on selected method
      if (this.selectedPaymentMethod() === 'card') {
        await this.processCardPayment(clientSecret);
      } else if (this.selectedPaymentMethod() === 'apple' || this.selectedPaymentMethod() === 'google') {
        await this.processWalletPayment(clientSecret);
      }

    } catch (error) {
      this.isProcessing.set(false);
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  }

  private async processCardPayment(clientSecret: string): Promise<void> {
    // Check rate limits before processing
    if (!this.canProcessPayment()) {
      this.errorMessage.set('Too many payment attempts. Please wait before trying again.');
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');
    
    // Record payment attempt
    this.recordPaymentAttempt();

    try {
      // Create payment intent first
      const paymentIntentResponse = await firstValueFrom(
        this.http.post<any>('/api/payments/create-intent', {
          amount: this.getTotalWithFees(),
          bookingFee: this.getBookingFees(),
          currency: 'eur',
          userId: '1', // TODO: Get from actual user service
          eventId: this.event()?.id?.toString() || '',
          ticketId: this.selectedTickets()[0]?.ticket.id?.toString() || '',
          quantity: this.selectedTickets().reduce((sum, selection) => sum + selection.quantity, 0)
        })
      );

      // Process payment with Stripe
      const result = await this.stripeService.processCardPayment(paymentIntentResponse.clientSecret);
      
      if (result.error) {
        this.handlePaymentError(result.error);
      } else if (result.paymentIntent?.status === 'succeeded') {
        await this.completeTicketPurchase(result.paymentIntent.id);
        this.clearPaymentAttempts(); // Clear attempts on success
      } else {
        this.errorMessage.set('Payment processing incomplete. Please try again.');
      }
    } catch (error) {
      this.handlePaymentError(error);
    } finally {
      this.isProcessing.set(false);
    }
  }

  private async processWalletPayment(clientSecret: string): Promise<void> {
    try {
      await this.stripeService.processPaymentRequestPayment(clientSecret);
      // Payment success will be handled in the payment request callback
      await this.completeTicketPurchase(clientSecret);
    } catch (error) {
      throw error;
    }
  }

  private async completeTicketPurchase(paymentIntentId: string): Promise<void> {
    const purchaseRequest: PurchaseRequest = {
      ticketSelections: this.selectedTickets().map(selection => ({
        ticketId: selection.ticket.id,
        quantity: selection.quantity
      })),
      paymentMethod: this.selectedPaymentMethod(),
      stripePaymentIntentId: paymentIntentId
    };

    this.userTicketService.purchaseTickets(purchaseRequest).subscribe({
      next: (response) => {
        this.isProcessing.set(false);
        alert('Payment processed successfully!');
        this.router.navigate(['/my-tickets']);
      },
      error: (error) => {
        this.isProcessing.set(false);
        console.error('Ticket purchase failed:', error);
        alert('Payment succeeded but ticket creation failed. Please contact support.');
      }
    });
  }

  goBack(): void {
    const eventId = this.event()?.id;
    if (eventId) {
      this.router.navigate(['/event', eventId, 'tickets']);
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Check for suspicious payment behavior
   */
  private checkPaymentAttemptLimits(): void {
    const storedAttempts = localStorage.getItem('payment_attempts');
    const storedLastAttempt = localStorage.getItem('last_payment_attempt');
    
    if (storedAttempts) {
      this.paymentAttempts = parseInt(storedAttempts, 10);
    }
    
    if (storedLastAttempt) {
      this.lastPaymentAttemptTime = parseInt(storedLastAttempt, 10);
    }
  }

  /**
   * Check if payment can be processed based on rate limits
   */
  private canProcessPayment(): boolean {
    const now = Date.now();
    
    // Check maximum attempts
    if (this.paymentAttempts >= this.maxPaymentAttempts) {
      return false;
    }
    
    // Check cooldown period
    if (this.lastPaymentAttemptTime > 0 && (now - this.lastPaymentAttemptTime) < this.paymentCooldownMs) {
      return false;
    }
    
    return true;
  }

  /**
   * Record payment attempt for rate limiting
   */
  private recordPaymentAttempt(): void {
    this.paymentAttempts++;
    this.lastPaymentAttemptTime = Date.now();
    
    localStorage.setItem('payment_attempts', this.paymentAttempts.toString());
    localStorage.setItem('last_payment_attempt', this.lastPaymentAttemptTime.toString());
  }

  /**
   * Clear payment attempts on successful payment
   */
  private clearPaymentAttempts(): void {
    this.paymentAttempts = 0;
    this.lastPaymentAttemptTime = 0;
    
    localStorage.removeItem('payment_attempts');
    localStorage.removeItem('last_payment_attempt');
  }

  /**
   * Enhanced error handling with specific messages
   */
  private handlePaymentError(error: any): void {
    console.error('Payment error:', error);
    
    // Provide specific error messages based on error type
    if (error.type === 'card_error') {
      switch (error.code) {
        case 'card_declined':
          this.errorMessage.set('Your card was declined. Please check your card details or try a different card.');
          break;
        case 'insufficient_funds':
          this.errorMessage.set('Insufficient funds. Please check your account balance.');
          break;
        case 'expired_card':
          this.errorMessage.set('Your card has expired. Please use a different card.');
          break;
        case 'incorrect_cvc':
          this.errorMessage.set('The security code (CVC) is incorrect. Please check and try again.');
          break;
        default:
          this.errorMessage.set(`Card error: ${error.message || 'Please check your card details.'}`);
      }
    } else {
      this.errorMessage.set('An error occurred while processing your payment. Please try again.');
    }
  }
} 