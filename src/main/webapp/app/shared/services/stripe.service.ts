import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements, StripeCardElement, PaymentRequest, PaymentRequestPaymentMethodEvent } from '@stripe/stripe-js';
import { environment } from 'environments/environment';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;
  private paymentRequest: PaymentRequest | null = null;
  private stripePublishableKey: string | null = null;

  private http = inject(HttpClient);

  async initializeStripe(): Promise<void> {
    if (!this.stripe) {
      if (!this.stripePublishableKey) {
        await this.loadStripeConfig();
      }
      if (this.stripePublishableKey) {
        try {
          this.stripe = await loadStripe(this.stripePublishableKey);
          console.log('Stripe loaded successfully');
        } catch (error) {
          console.error('Failed to load Stripe:', error);
          throw new Error('Failed to initialize Stripe');
        }
      } else {
        throw new Error('Failed to load Stripe configuration');
      }
    }
  }

  private async loadStripeConfig(): Promise<void> {
    try {
      const config = await firstValueFrom(
        this.http.get<{ publishableKey: string }>('/api/stripe/config').pipe(
          // Add a 5-second timeout
          timeout(5000)
        )
      );
      this.stripePublishableKey = (config as { publishableKey: string }).publishableKey;
      console.log('Stripe config loaded successfully');
    } catch (error) {
      console.error('Failed to load Stripe configuration:', error);
      // Try to use a fallback key for development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Using fallback test key for development');
        this.stripePublishableKey = 'pk_test_51RhWHeFZCL6fhfMsDOgEH0Kq7hCcZrejYIghESUWhBfGTBeRccYtYuWTmsbR7ZrjArJtwSprSneoQHNHYhNDRkyB002qQLBtgw';
      } else {
        throw error;
      }
    }
  }

  async createElements(): Promise<void> {
    if (!this.stripe) {
      await this.initializeStripe();
    }
    
    if (this.stripe && !this.elements) {
      this.elements = this.stripe.elements();
    }
  }

  async createCardElement(elementId: string): Promise<void> {
    await this.createElements();
    
    if (!this.elements) {
      throw new Error('Stripe elements not initialized');
    }
    
    if (!this.cardElement) {
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '18px',
            color: '#000000',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '::placeholder': {
              color: '#6c757d'
            }
          },
          invalid: {
            color: '#dc3545',
            iconColor: '#dc3545'
          }
        },
        hidePostalCode: true
      });
      
      const cardElementContainer = document.getElementById(elementId);
      if (!cardElementContainer) {
        throw new Error(`Element with ID '${elementId}' not found`);
      }
      
      this.cardElement.mount(`#${elementId}`);
    }
  }

  async createPaymentRequest(amount: number, currency: string = 'eur'): Promise<PaymentRequest | null> {
    if (!this.stripe) {
      await this.initializeStripe();
    }

    if (!this.stripe) return null;

    this.paymentRequest = this.stripe.paymentRequest({
      country: 'IE', // Ireland
      currency: currency.toLowerCase(),
      total: {
        label: 'Total',
        amount: Math.round(amount * 100), // Stripe expects amounts in cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if Apple Pay / Google Pay is available
    const result = await this.paymentRequest.canMakePayment();
    return result ? this.paymentRequest : null;
  }

  async processCardPayment(clientSecret: string): Promise<any> {
    if (!this.stripe || !this.cardElement) {
      throw new Error('Stripe not initialized');
    }

    // Validate client secret format for security
    if (!this.isValidClientSecret(clientSecret)) {
      throw new Error('Invalid client secret format');
    }

    try {
      // First, retrieve the payment intent to check its current status
      const paymentIntentId = clientSecret.split('_secret_')[0];
      const paymentIntent = await this.stripe.retrievePaymentIntent(clientSecret);
      
      // Handle different payment intent states
      switch (paymentIntent.paymentIntent?.status) {
        case 'succeeded':
        case 'processing':
          return paymentIntent;
          
        case 'canceled':
          throw new Error('Payment was canceled');
          
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
          // These are the states where we can confirm the payment
          break;
          
        default:
          break;
      }

      // Proceed with confirmation
      console.log('Stripe: Confirming card payment with client secret:', clientSecret);
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
        }
      });

      console.log('Stripe: Payment confirmation result:', result);
      console.log('Stripe: Payment status:', result.paymentIntent?.status);
      console.log('Stripe: Payment ID:', result.paymentIntent?.id);
      
      return result;
      
    } catch (error: any) {
      // Handle specific Stripe error codes
      if (error.code === 'payment_intent_unexpected_state') {
        // Try to retrieve the current state and handle appropriately
        try {
          const paymentIntent = await this.stripe.retrievePaymentIntent(clientSecret);
          if (paymentIntent.paymentIntent?.status === 'succeeded') {
            return paymentIntent;
          }
        } catch (retrieveError) {
          // Ignore retrieval errors
        }
      }
      
      throw error;
    }
  }

  /**
   * Validate client secret format
   * @param clientSecret The client secret to validate
   * @returns true if valid format
   */
  private isValidClientSecret(clientSecret: string): boolean {
    // Stripe client secrets follow pattern: pi_xxx_secret_xxx
    const clientSecretPattern = /^pi_[a-zA-Z0-9]+_secret_[a-zA-Z0-9]+$/;
    return clientSecretPattern.test(clientSecret);
  }

  async processPaymentRequestPayment(clientSecret: string): Promise<any> {
    if (!this.paymentRequest) {
      throw new Error('Payment request not initialized');
    }

    // Return a promise that resolves when payment is completed
    return new Promise((resolve, reject) => {
      this.paymentRequest!.on('paymentmethod', async (event: PaymentRequestPaymentMethodEvent) => {
        if (!this.stripe) {
          event.complete('fail');
          reject(new Error('Stripe not initialized'));
          return;
        }

        try {
          console.log('Processing wallet payment with client secret:', clientSecret);
          const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
            payment_method: event.paymentMethod.id
          });

          if (error) {
            console.error('Wallet payment failed:', error);
            event.complete('fail');
            reject(error);
          } else {
            console.log('Wallet payment succeeded:', paymentIntent);
            event.complete('success');
            resolve({ paymentIntent, error: null });
          }
        } catch (err) {
          console.error('Wallet payment error:', err);
          event.complete('fail');
          reject(err);
        }
      });

      // Show the payment request (Apple Pay/Google Pay sheet)
      try {
        this.paymentRequest!.show();
      } catch (error) {
        console.error('Failed to show payment request:', error);
        reject(error);
      }
    });
  }

  getPaymentRequest(): PaymentRequest | null {
    return this.paymentRequest;
  }

  getCardElement(): StripeCardElement | null {
    return this.cardElement;
  }

  destroy(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
    this.elements = null;
    this.paymentRequest = null;
  }
} 