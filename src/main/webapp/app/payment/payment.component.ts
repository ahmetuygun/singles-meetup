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
import { IPromoCode, PromoCodeType } from '../entities/promo-code/promo-code.model';

@Component({
  selector: 'jhi-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
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
  
  // Promo code properties
  promoCodeInput = '';
  appliedPromoCode = signal<IPromoCode | null>(null);
  promoCodeApplied = signal<boolean>(false);
  promoCodeError = signal<string>('');
  isApplyingPromoCode = signal<boolean>(false);
  
  // Booking fee properties
  bookingFee = signal<number>(0);
  bookingFeeConfig = signal<{percentage: number, constant: number} | null>(null);
  
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
  stripeCardElementComplete = signal<boolean>(false);
  
  // Error handling
  errorMessage = signal<string>('');

  // Modal states
  showPaymentModal = signal<boolean>(false);
  paymentSuccess = signal<boolean>(false);
  paymentErrorMessage = signal<string>('');

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
      // Initialize Stripe first, then setup the card element
      this.initializeStripe().then(() => {
        // After Stripe is initialized, mount the card element if card is selected
        if (this.selectedPaymentMethod() === 'card') {
          setTimeout(() => this.mountStripeCardElement(), 200);
        }
      });
      
      // Load booking fee configuration and calculate fees
      this.loadBookingFeeConfig();
    } else {
      // If no state, redirect back
      this.router.navigate(['/']);
    }
    this.checkPaymentAttemptLimits();
  }

  ngAfterViewInit(): void {
    // Ensure card element is mounted after view is ready
    if (this.isStripeInitialized() && this.selectedPaymentMethod() === 'card' && !this.stripeCardElementMounted()) {
      setTimeout(() => this.mountStripeCardElement(), 100);
    }
  }

  ngOnDestroy(): void {
    // Clean up Stripe elements
    this.stripeService.destroy();
  }

  async initializeStripe(): Promise<void> {
    try {
      console.log('Initializing Stripe...');
      await this.stripeService.initializeStripe();
      this.isStripeInitialized.set(true);
      console.log('Stripe initialized successfully');
      
      // Check if Apple Pay / Google Pay is available
      await this.checkWalletPaymentAvailability();
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.errorMessage.set('Failed to initialize payment system. Please refresh the page.');
    }
  }

  async checkWalletPaymentAvailability(): Promise<void> {
    try {
      const paymentRequest = await this.stripeService.createPaymentRequest(this.getTotalWithFees());
      if (paymentRequest) {
        const result = await paymentRequest.canMakePayment();
        if (result) {
          this.applePayAvailable.set(result.applePay || false);
          this.googlePayAvailable.set(result.googlePay || false);
          console.log('Apple Pay available:', result.applePay);
          console.log('Google Pay available:', result.googlePay);
        } else {
          console.log('No wallet payment methods available');
          this.applePayAvailable.set(false);
          this.googlePayAvailable.set(false);
        }
      } else {
        console.log('Payment request not supported');
        this.applePayAvailable.set(false);
        this.googlePayAvailable.set(false);
      }
    } catch (error) {
      console.error('Failed to check wallet payment availability:', error);
      this.applePayAvailable.set(false);
      this.googlePayAvailable.set(false);
    }
  }

  async mountStripeCardElement(): Promise<void> {
    if (!this.stripeCardElementMounted()) {
      try {
        console.log('Mounting Stripe card element...');
        const cardElementContainer = document.getElementById('stripe-card-element');
        if (!cardElementContainer) {
          console.error('Card element container not found');
          return;
        }
        
        await this.stripeService.createCardElement('stripe-card-element');
        this.stripeCardElementMounted.set(true);
        console.log('Stripe card element mounted successfully');
        
        // Setup card element change listener
        const cardElement = this.stripeService.getCardElement();
        if (cardElement) {
          cardElement.on('change', (event) => {
            this.stripeCardElementComplete.set(event.complete);
            
            if (event.error) {
              this.errorMessage.set(event.error.message);
            } else {
              this.errorMessage.set('');
            }
          });
        }
      } catch (error) {
        console.error('Failed to mount Stripe card element:', error);
        this.errorMessage.set('Failed to load card input. Please refresh the page.');
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

  getTotalWithFees(): number {
    const subtotal = this.getTotalPrice();
    const discountedSubtotal = this.applyPromoCodeDiscount(subtotal);
    return discountedSubtotal + this.bookingFee();
  }

  private applyPromoCodeDiscount(subtotal: number): number {
    if (!this.promoCodeApplied() || !this.appliedPromoCode()) {
      return subtotal;
    }

    const promoCode = this.appliedPromoCode()!;
    
    switch (promoCode.type) {
      case PromoCodeType.PERCENTAGE:
        const discountPercentage = (promoCode.value || 0) / 100;
        return subtotal * (1 - discountPercentage);
      case PromoCodeType.FIXED:
        return Math.max(0, subtotal - (promoCode.value || 0));
      case PromoCodeType.FREE:
        return 0;
      default:
        return subtotal;
    }
  }

  getPromoCodeDiscount(): number {
    if (!this.promoCodeApplied() || !this.appliedPromoCode()) {
      return 0;
    }

    const subtotal = this.getTotalPrice();
    const finalTotal = this.applyPromoCodeDiscount(subtotal);
    return subtotal - finalTotal;
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
    if (this.selectedPaymentMethod() === 'apple' || this.selectedPaymentMethod() === 'google') {
      // Handle Apple Pay / Google Pay
      this.isProcessing.set(true);
      this.completePurchase();
    } else if (this.selectedPaymentMethod() === 'card') {
      // Handle card payment with Stripe Elements
      if (this.validateCardForm()) {
        this.isProcessing.set(true);
        this.completePurchase();
      }
    }
  }

  validateCardForm(): boolean {
    // For Stripe Elements, we check if the card element is complete and valid
    if (this.selectedPaymentMethod() === 'card') {
      return this.stripeCardElementMounted() && this.stripeCardElementComplete();
    }
    return true;
  }

  getButtonDisabled(): boolean {
    const totalAmount = this.getTotalWithFees();
    const isFreePurchase = totalAmount === 0;
    
    // For free purchases, only check if processing
    if (isFreePurchase) {
      return this.isProcessing();
    }
    
    // For paid purchases, check processing and card validation if card payment is selected
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
      console.log('completePurchase: Setting processing to true');
      this.isProcessing.set(true);

      // Check if this is a free purchase (total amount is 0)
      const totalAmount = this.getTotalWithFees();
      console.log('Total amount for purchase:', totalAmount);

      if (totalAmount === 0) {
        // Free purchase - skip payment processing and create tickets directly
        console.log('Free purchase detected, skipping payment processing');
        try {
          await this.completeTicketPurchase('FREE_PURCHASE');
          this.clearPaymentAttempts(); // Clear attempts on success
          console.log('Free ticket purchase completed successfully');
        } catch (completionError) {
          console.log('Free ticket completion failed:', completionError);
          this.handlePaymentError(completionError);
        }
      } else {
        // Paid purchase - process payment based on selected method
        if (this.selectedPaymentMethod() === 'card') {
          await this.processCardPayment();
        } else if (this.selectedPaymentMethod() === 'apple' || this.selectedPaymentMethod() === 'google') {
          await this.processWalletPayment();
        }
      }

      // Only reset processing if no modal is shown (success case)
      if (!this.showPaymentModal()) {
        console.log('completePurchase: Payment completed without modal, resetting processing');
        this.isProcessing.set(false);
      } else {
        console.log('completePurchase: Modal shown, keeping processing state for user interaction');
      }

    } catch (error) {
      console.log('completePurchase: Error caught, resetting processing to false');
      this.isProcessing.set(false);
      console.error('Payment failed:', error);
      this.paymentSuccess.set(false);
      this.paymentErrorMessage.set('Payment failed. Please try again.');
      this.showPaymentModal.set(true);
    }
  }

  private async processCardPayment(): Promise<void> {
    // Check rate limits before processing
    console.log('Checking payment limits - attempts:', this.paymentAttempts, 'max:', this.maxPaymentAttempts);
    if (!this.canProcessPayment()) {
      const error = new Error('Too many payment attempts. Please wait before trying again.');
      this.errorMessage.set(error.message);
      throw error;
    }

    this.errorMessage.set('');
    
    // Record payment attempt
    this.recordPaymentAttempt();

    try {
      // Create payment intent first
      const paymentIntentResponse = await firstValueFrom(
        this.http.post<any>('/api/payments/create-intent', {
          amount: this.getTotalWithFees().toFixed(2),
          currency: 'eur',
          userId: '1', // TODO: Get from actual user service
          eventId: this.event()?.id?.toString() || '',
          ticketId: this.selectedTickets()[0]?.ticket.id?.toString() || '',
          quantity: this.selectedTickets().reduce((sum, selection) => sum + selection.quantity, 0)
        })
      );

      // Process payment with Stripe
      const result = await this.stripeService.processCardPayment(paymentIntentResponse.clientSecret);
      
      // LOG STRIPE RESPONSE FOR DEBUGGING
      console.log('=== STRIPE PAYMENT RESULT ===');
      console.log('Full result:', result);
      console.log('Payment Intent:', result.paymentIntent);
      console.log('Payment Status:', result.paymentIntent?.status);
      console.log('Payment ID:', result.paymentIntent?.id);
      console.log('Error:', result.error);
      console.log('==============================');
      
      if (result.error) {
        console.log('Processing payment error:', result.error);
        this.handlePaymentError(result.error);
      } else if (result.paymentIntent?.status === 'succeeded' || result.paymentIntent?.status === 'processing') {
        console.log('Payment successful, completing ticket purchase...');
        try {
          await this.completeTicketPurchase(result.paymentIntent.id);
          this.clearPaymentAttempts(); // Clear attempts on success
          console.log('Ticket purchase completed successfully');
          // Success modal will be shown by completeTicketPurchase
        } catch (completionError) {
          console.log('Ticket completion failed:', completionError);
          this.handlePaymentError(completionError);
        }
      } else if (result.paymentIntent?.status === 'requires_action') {
        console.log('Payment requires additional action');
        this.errorMessage.set('Payment requires additional authentication. Please complete the verification and try again.');
      } else {
        console.log('Payment processing incomplete, status:', result.paymentIntent?.status);
        this.errorMessage.set('Payment processing incomplete. Please try again.');
      }
    } catch (error: any) {
      this.handlePaymentError(error);
      throw error; // Re-throw to let completePurchase handle it
    }
  }

  private async processWalletPayment(): Promise<void> {
    // Check rate limits before processing
    if (!this.canProcessPayment()) {
      const error = new Error('Too many payment attempts. Please wait before trying again.');
      this.errorMessage.set(error.message);
      throw error;
    }

    this.errorMessage.set('');
    
    // Record payment attempt
    this.recordPaymentAttempt();

    try {
      // Create payment intent first
      const paymentIntentResponse = await firstValueFrom(
        this.http.post<any>('/api/payments/create-intent', {
          amount: this.getTotalWithFees().toFixed(2),
          currency: 'eur',
          userId: '1', // TODO: Get from actual user service
          eventId: this.event()?.id?.toString() || '',
          ticketId: this.selectedTickets()[0]?.ticket.id?.toString() || '',
          quantity: this.selectedTickets().reduce((sum, selection) => sum + selection.quantity, 0)
        })
      );

      // Create fresh payment request for this payment attempt
      const paymentRequest = await this.stripeService.createPaymentRequest(this.getTotalWithFees());
      if (!paymentRequest) {
        throw new Error('Wallet payment not available on this device');
      }
      
      // Process wallet payment with Stripe
      const result = await this.stripeService.processPaymentRequestPayment(paymentIntentResponse.clientSecret);
      
      // LOG WALLET PAYMENT RESULT FOR DEBUGGING
      console.log('=== WALLET PAYMENT RESULT ===');
      console.log('Full result:', result);
      console.log('Payment Intent:', result.paymentIntent);
      console.log('Payment Status:', result.paymentIntent?.status);
      console.log('Payment ID:', result.paymentIntent?.id);
      console.log('Error:', result.error);
      console.log('=============================');
      
      if (result.error) {
        console.log('Processing wallet payment error:', result.error);
        this.handlePaymentError(result.error);
      } else if (result.paymentIntent?.status === 'succeeded' || result.paymentIntent?.status === 'processing') {
        console.log('Wallet payment successful, completing ticket purchase...');
        try {
          await this.completeTicketPurchase(result.paymentIntent.id);
          this.clearPaymentAttempts(); // Clear attempts on success
          console.log('Wallet ticket purchase completed successfully');
        } catch (completionError) {
          console.log('Wallet ticket completion failed:', completionError);
          this.handlePaymentError(completionError);
        }
      } else {
        console.log('Wallet payment processing incomplete, status:', result.paymentIntent?.status);
        this.errorMessage.set('Payment processing incomplete. Please try again.');
      }
    } catch (error) {
      this.handlePaymentError(error);
      throw error; // Re-throw to let completePurchase handle it
    }
  }

  private async completeTicketPurchase(paymentIntentId: string): Promise<void> {
    const purchaseRequest: PurchaseRequest = {
      ticketSelections: this.selectedTickets().map(selection => {
        // Calculate the discounted amounts for this ticket selection
        const originalTotalPrice = (selection.ticket.price || 0) * selection.quantity;
        
        // Apply promo code discount if available
        let discountedTotalPrice = originalTotalPrice;
        
        if (this.promoCodeApplied() && this.appliedPromoCode()) {
          const promoCode = this.appliedPromoCode()!;
          
          switch (promoCode.type) {
            case 'PERCENTAGE':
              const discountPercentage = (promoCode.value || 0) / 100;
              discountedTotalPrice = Math.max(0, originalTotalPrice * (1 - discountPercentage));
              break;
            case 'FIXED':
              const fixedDiscount = promoCode.value || 0;
              discountedTotalPrice = Math.max(0, originalTotalPrice - fixedDiscount);
              break;
            case 'FREE':
              discountedTotalPrice = 0;
              break;
          }
        }
        
        return {
          ticketId: selection.ticket.id,
          quantity: selection.quantity,
          discountedTotalPrice: discountedTotalPrice
        };
      }),
      paymentMethod: paymentIntentId === 'FREE_PURCHASE' ? 'free' : this.selectedPaymentMethod(),
      stripePaymentIntentId: paymentIntentId === 'FREE_PURCHASE' ? undefined : paymentIntentId
    };

    return new Promise<void>((resolve, reject) => {
      this.userTicketService.purchaseTickets(purchaseRequest).subscribe({
        next: (response) => {
          this.paymentSuccess.set(true);
          this.showPaymentModal.set(true);
          resolve();
        },
        error: (error) => {
          this.paymentSuccess.set(false);
          this.paymentErrorMessage.set('Payment succeeded but ticket creation failed. Please contact support.');
          this.showPaymentModal.set(true);
          reject(error);
        }
      });
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

  async loadBookingFeeConfig(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{percentage: number, constant: number}>('/api/payments/stripe-fee-config')
      );
      this.bookingFeeConfig.set(response);
      this.calculateBookingFee();
    } catch (error) {
      console.error('Failed to load booking fee config:', error);
    }
  }

  calculateBookingFee(): void {
    const config = this.bookingFeeConfig();
    if (!config) return;
    
    const subtotal = this.getTotalPrice();
    const discountedSubtotal = this.applyPromoCodeDiscount(subtotal);
    
    // If promo code is FREE, no booking fee
    if (this.promoCodeApplied() && this.appliedPromoCode()?.type === 'FREE') {
      this.bookingFee.set(0);
      return;
    }
    
    // Calculate booking fee: percentage * amount + constant
    const bookingFee = (discountedSubtotal * config.percentage / 100) + config.constant;
    this.bookingFee.set(bookingFee);
  }

  closePaymentModal(): void {
    const wasSuccessful = this.paymentSuccess();
    
    this.showPaymentModal.set(false);
    this.paymentSuccess.set(false);
    this.paymentErrorMessage.set('');
    
    // Reset processing state when modal is closed
    this.isProcessing.set(false);
    console.log('Modal closed, processing state reset to:', this.isProcessing());
    
    // If payment was successful, automatically route to tickets page
    if (wasSuccessful) {
      this.router.navigate(['/my-tickets']);
    }
  }

  goToMyTickets(): void {
    this.closePaymentModal();
    // Route to my tickets page
    this.router.navigate(['/my-tickets']);
  }

  // Promo code methods
  async applyPromoCode(): Promise<void> {
    if (!this.promoCodeInput || this.promoCodeInput.trim().length === 0) {
      return;
    }

    this.isApplyingPromoCode.set(true);
    this.promoCodeError.set('');

    try {
      const response = await firstValueFrom(
        this.http.post<any>('/api/promo-codes/validate', {
          code: this.promoCodeInput.trim().toUpperCase(),
          eventId: this.event()?.id,
          totalAmount: this.getTotalPrice() + this.getPromoCodeDiscount()
        })
      );

      if (response.valid) {
        this.appliedPromoCode.set(response.promoCode);
        this.promoCodeApplied.set(true);
        this.promoCodeInput = '';
        // Recalculate booking fee after applying promo code
        this.calculateBookingFee();
      } else {
        this.promoCodeError.set(response.message || 'Invalid promo code');
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.status === 404) {
        this.promoCodeError.set('Promo code not found. Please check the code and try again.');
      } else if (error.status === 400) {
        this.promoCodeError.set(error.error?.message || 'Invalid promo code. Please check the code and try again.');
      } else if (error.status === 410) {
        this.promoCodeError.set('This promo code has expired or is no longer valid.');
      } else if (error.status === 409) {
        this.promoCodeError.set('This promo code has reached its maximum usage limit.');
      } else {
        this.promoCodeError.set('Error applying promo code. Please try again.');
      }
    } finally {
      this.isApplyingPromoCode.set(false);
    }
  }

  removePromoCode(): void {
    this.appliedPromoCode.set(null);
    this.promoCodeApplied.set(false);
    this.promoCodeError.set('');
    // Recalculate booking fee after removing promo code
    this.calculateBookingFee();
  }

  resetPaymentState(): void {
    this.isProcessing.set(false);
    this.errorMessage.set('');
    this.paymentSuccess.set(false);
    this.paymentErrorMessage.set('');
    this.showPaymentModal.set(false);
    // Also clear payment attempts when resetting state
    this.clearPaymentAttempts();
  }

  refreshAndRetry(): void {
    // Reset all payment state
    this.resetPaymentState();
    
    // Destroy and reinitialize Stripe elements to get a fresh state
    this.stripeService.destroy();
    this.stripeCardElementMounted.set(false);
    this.stripeCardElementComplete.set(false);
    
    // Reinitialize Stripe and mount card element
    setTimeout(async () => {
      try {
        await this.initializeStripe();
        if (this.selectedPaymentMethod() === 'card') {
          await this.mountStripeCardElement();
        }
      } catch (error) {
        console.error('Failed to reinitialize Stripe:', error);
        this.errorMessage.set('Failed to refresh payment system. Please reload the page.');
      }
    }, 100);
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
    
    console.log('canProcessPayment check:');
    console.log('- Current attempts:', this.paymentAttempts);
    console.log('- Max attempts:', this.maxPaymentAttempts);
    console.log('- Last attempt time:', this.lastPaymentAttemptTime);
    console.log('- Current time:', now);
    console.log('- Time since last attempt:', this.lastPaymentAttemptTime > 0 ? now - this.lastPaymentAttemptTime : 'N/A');
    console.log('- Cooldown period:', this.paymentCooldownMs);
    
    // Check maximum attempts
    if (this.paymentAttempts >= this.maxPaymentAttempts) {
      console.log('Payment blocked: Too many attempts');
      return false;
    }
    
    // Check cooldown period
    if (this.lastPaymentAttemptTime > 0 && (now - this.lastPaymentAttemptTime) < this.paymentCooldownMs) {
      console.log('Payment blocked: Still in cooldown period');
      return false;
    }
    
    console.log('Payment allowed');
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
  clearPaymentAttempts(): void {
    this.paymentAttempts = 0;
    this.lastPaymentAttemptTime = 0;
    
    localStorage.removeItem('payment_attempts');
    localStorage.removeItem('last_payment_attempt');
    console.log('Payment attempts cleared');
  }

  /**
   * Enhanced error handling with specific messages
   */
  private handlePaymentError(error: any): void {
    console.error('Payment error:', error);
    
    let errorMessage = '';
    
    // Handle Stripe-specific errors
    if (error.type === 'card_error') {
      switch (error.code) {
        case 'card_declined':
          errorMessage = 'Your card was declined. Please check your card details or try a different card.';
          break;
        case 'insufficient_funds':
          errorMessage = 'Insufficient funds. Please check your account balance.';
          break;
        case 'expired_card':
          errorMessage = 'Your card has expired. Please use a different card.';
          break;
        case 'incorrect_cvc':
          errorMessage = 'The security code (CVC) is incorrect. Please check and try again.';
          break;
        default:
          errorMessage = `Card error: ${error.message || 'Please check your card details.'}`;
      }
    } else if (error.type === 'invalid_request_error') {
      switch (error.code) {
        case 'payment_intent_unexpected_state':
          errorMessage = 'This payment has already been processed or is in an invalid state. Please refresh the page and try again.';
          break;
        case 'payment_method_not_available':
          errorMessage = 'This payment method is not available. Please try a different card.';
          break;
        default:
          errorMessage = `Payment error: ${error.message || 'Please try again.'}`;
      }
    } else if (error.type === 'authentication_error') {
      errorMessage = 'Payment authentication failed. Please verify your payment details and try again.';
    } else if (error.type === 'rate_limit_error') {
      errorMessage = 'Too many payment requests. Please wait a moment and try again.';
    } else if (error.message) {
      // Handle custom error messages
      if (error.message.includes('already been processed')) {
        errorMessage = 'This payment has already been processed. Please check your tickets or refresh the page.';
      } else if (error.message.includes('canceled')) {
        errorMessage = 'Payment was canceled. Please try again with a new payment.';
      } else {
        errorMessage = error.message;
      }
    } else {
      errorMessage = 'An error occurred while processing your payment. Please try again.';
    }
    
    // Show payment failure modal
    this.paymentSuccess.set(false);
    this.paymentErrorMessage.set(errorMessage);
    this.showPaymentModal.set(true);
  }
} 