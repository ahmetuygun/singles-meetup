import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeElements, StripeCardElement, PaymentRequest, PaymentRequestPaymentMethodEvent } from '@stripe/stripe-js';
import { environment } from 'environments/environment';
import { firstValueFrom } from 'rxjs';

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
        this.stripe = await loadStripe(this.stripePublishableKey);
      } else {
        throw new Error('Failed to load Stripe configuration');
      }
    }
  }

  private async loadStripeConfig(): Promise<void> {
    try {
      const config = await firstValueFrom(
        this.http.get<{ publishableKey: string }>('/api/stripe/config')
      );
      this.stripePublishableKey = config.publishableKey;
    } catch (error) {
      console.error('Failed to load Stripe configuration:', error);
      throw error;
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
    
    if (this.elements && !this.cardElement) {
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '18px',
            color: '#000000',
            '::placeholder': {
              color: '#6c757d'
            }
          }
        },
        hidePostalCode: true
      });
      
      const cardElementContainer = document.getElementById(elementId);
      if (cardElementContainer) {
        this.cardElement.mount(`#${elementId}`);
      }
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

    const result = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
      }
    });

    return result;
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

  async processPaymentRequestPayment(clientSecret: string): Promise<void> {
    if (!this.paymentRequest) {
      throw new Error('Payment request not initialized');
    }

    this.paymentRequest.on('paymentmethod', async (event: PaymentRequestPaymentMethodEvent) => {
      if (!this.stripe) return;

      const { error } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: event.paymentMethod.id
      });

      if (error) {
        event.complete('fail');
        throw error;
      } else {
        event.complete('success');
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