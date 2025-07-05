package com.meet.singles.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
import com.stripe.net.RequestOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {

    private final Logger log = LoggerFactory.getLogger(StripeService.class);

    /**
     * Create a payment intent with Stripe
     * @param amount Amount in cents
     * @param currency Currency code (e.g., "usd", "eur")
     * @param metadata Optional metadata
     * @return PaymentIntent object
     * @throws StripeException if the request fails
     */
    public PaymentIntent createPaymentIntent(Long amount, String currency, Map<String, String> metadata) throws StripeException {
        log.debug("Creating payment intent for amount: {} {}", amount, currency);
        
        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
            .setAmount(amount)
            .setCurrency(currency)
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            );
        
        if (metadata != null && !metadata.isEmpty()) {
            paramsBuilder.putAllMetadata(metadata);
        }
        
        PaymentIntentCreateParams params = paramsBuilder.build();
        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        log.debug("Created payment intent with ID: {}", paymentIntent.getId());
        return paymentIntent;
    }

    /**
     * Create a payment intent with idempotency key to prevent duplicate charges
     * @param amount Amount in cents
     * @param currency Currency code (e.g., "usd", "eur")
     * @param metadata Optional metadata
     * @param idempotencyKey Unique key to prevent duplicate requests
     * @return PaymentIntent object
     * @throws StripeException if the request fails
     */
    public PaymentIntent createPaymentIntentWithIdempotency(Long amount, String currency, Map<String, String> metadata, String idempotencyKey) throws StripeException {
        log.info("Creating payment intent with idempotency key for amount: {} {} with idempotency key: {}", amount, currency, idempotencyKey);
        
        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
            .setAmount(amount)
            .setCurrency(currency)
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            );
        
        if (metadata != null && !metadata.isEmpty()) {
            paramsBuilder.putAllMetadata(metadata);
            log.info("Adding metadata to payment intent: {}", metadata);
        }
        
        PaymentIntentCreateParams params = paramsBuilder.build();
        
        // Create request options with idempotency key
        RequestOptions requestOptions = RequestOptions.builder()
            .setIdempotencyKey(idempotencyKey)
            .build();
        
        try {
            PaymentIntent paymentIntent = PaymentIntent.create(params, requestOptions);
            
            log.info("Successfully created payment intent with ID: {} using idempotency key: {}", paymentIntent.getId(), idempotencyKey);
            log.info("Payment intent details: Amount={}, Currency={}, Status={}, Client Secret exists={}", 
                paymentIntent.getAmount(), 
                paymentIntent.getCurrency(), 
                paymentIntent.getStatus(),
                paymentIntent.getClientSecret() != null);
            
            return paymentIntent;
        } catch (StripeException e) {
            log.error("Failed to create payment intent with idempotency key: {}. Error: {}", idempotencyKey, e.getMessage());
            throw e;
        }
    }

    /**
     * Confirm a payment intent
     * @param paymentIntentId Payment intent ID
     * @param paymentMethodId Payment method ID
     * @return PaymentIntent object
     * @throws StripeException if the request fails
     */
    public PaymentIntent confirmPaymentIntent(String paymentIntentId, String paymentMethodId) throws StripeException {
        log.debug("Confirming payment intent: {} with payment method: {}", paymentIntentId, paymentMethodId);
        
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        
        PaymentIntentConfirmParams params = PaymentIntentConfirmParams.builder()
            .setPaymentMethod(paymentMethodId)
            .build();
        
        PaymentIntent confirmedPaymentIntent = paymentIntent.confirm(params);
        
        log.debug("Payment intent confirmed with status: {}", confirmedPaymentIntent.getStatus());
        return confirmedPaymentIntent;
    }

    /**
     * Retrieve a payment intent
     * @param paymentIntentId Payment intent ID
     * @return PaymentIntent object
     * @throws StripeException if the request fails
     */
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        log.debug("Retrieving payment intent: {}", paymentIntentId);
        return PaymentIntent.retrieve(paymentIntentId);
    }

    /**
     * Convert BigDecimal amount to cents for Stripe
     * @param amount Amount in dollars/euros etc.
     * @return Amount in cents
     */
    public Long convertToCents(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).longValue();
    }

    /**
     * Convert cents back to BigDecimal
     * @param cents Amount in cents
     * @return Amount as BigDecimal
     */
    public BigDecimal convertFromCents(Long cents) {
        return BigDecimal.valueOf(cents).divide(BigDecimal.valueOf(100));
    }
} 