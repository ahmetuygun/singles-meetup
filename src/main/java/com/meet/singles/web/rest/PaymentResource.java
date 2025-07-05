package com.meet.singles.web.rest;

import com.meet.singles.service.StripeService;
import com.meet.singles.web.rest.dto.PaymentIntentRequest;
import com.meet.singles.web.rest.dto.PaymentIntentResponse;
import com.meet.singles.web.rest.dto.ConfirmPaymentRequest;
import com.meet.singles.web.rest.errors.BadRequestAlertException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentResource {

    private final Logger log = LoggerFactory.getLogger(PaymentResource.class);

    private static final String ENTITY_NAME = "payment";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final StripeService stripeService;

    public PaymentResource(StripeService stripeService) {
        this.stripeService = stripeService;
    }

    /**
     * {@code POST  /payments/create-intent} : Create a payment intent for Stripe
     *
     * @param request the payment intent request
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the payment intent response
     */
    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(@Valid @RequestBody PaymentIntentRequest request) {
        log.debug("REST request to create payment intent: {}", request);
        
        try {
            // Generate idempotency key to prevent duplicate charges
            String idempotencyKey = generateIdempotencyKey(request);
            
            // Create metadata for tracking
            Map<String, String> metadata = new HashMap<>();
            metadata.put("user_id", request.getUserId());
            metadata.put("event_id", request.getEventId());
            metadata.put("ticket_id", request.getTicketId());
            metadata.put("quantity", request.getQuantity().toString());
            
            // Convert amount to cents
            Long amountInCents = stripeService.convertToCents(request.getAmount().add(request.getBookingFee()));
            
            // Create payment intent with idempotency key
            PaymentIntent paymentIntent = stripeService.createPaymentIntentWithIdempotency(
                amountInCents, 
                request.getCurrency(), 
                metadata,
                idempotencyKey
            );
            
            log.info("Payment intent created successfully: ID={}, Amount={}, Currency={}, Status={}", 
                paymentIntent.getId(), 
                amountInCents, 
                request.getCurrency(), 
                paymentIntent.getStatus());
            
            PaymentIntentResponse response = new PaymentIntentResponse(
                paymentIntent.getId(),
                paymentIntent.getClientSecret(),
                stripeService.convertFromCents(paymentIntent.getAmount()),
                paymentIntent.getCurrency(),
                paymentIntent.getStatus()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            log.error("Error creating payment intent: {}", e.getMessage());
            throw new BadRequestAlertException("Failed to create payment intent: " + e.getMessage(), "payment", "paymentfailed");
        }
    }

    /**
     * Generate idempotency key based on request parameters
     * This ensures the same request parameters always generate the same key
     */
    private String generateIdempotencyKey(PaymentIntentRequest request) {
        String keySource = String.format("%s-%s-%s-%s-%s", 
            request.getUserId(),
            request.getEventId(), 
            request.getTicketId(),
            request.getQuantity(),
            request.getAmount().add(request.getBookingFee()).toString()
        );
        return UUID.nameUUIDFromBytes(keySource.getBytes()).toString();
    }

    /**
     * {@code POST  /payments/confirm} : Confirm a payment intent
     *
     * @param request the payment confirmation request
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the payment status
     */
    @PostMapping("/confirm")
    public ResponseEntity<PaymentIntentResponse> confirmPayment(@Valid @RequestBody ConfirmPaymentRequest request) {
        log.debug("REST request to confirm payment : {}", request.getPaymentIntentId());

        try {
            PaymentIntent paymentIntent;
            
            if (request.getPaymentMethodId() != null) {
                // Confirm with payment method (card payments)
                paymentIntent = stripeService.confirmPaymentIntent(request.getPaymentIntentId(), request.getPaymentMethodId());
            } else {
                // Retrieve payment intent (for wallet payments that auto-confirm)
                paymentIntent = stripeService.retrievePaymentIntent(request.getPaymentIntentId());
            }

            PaymentIntentResponse response = new PaymentIntentResponse();
            response.setPaymentIntentId(paymentIntent.getId());
            response.setClientSecret(paymentIntent.getClientSecret());
            response.setAmount(stripeService.convertFromCents(paymentIntent.getAmount()));
            response.setCurrency(paymentIntent.getCurrency());
            response.setStatus(paymentIntent.getStatus());

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            log.error("Error confirming payment", e);
            throw new BadRequestAlertException("Failed to confirm payment: " + e.getMessage(), ENTITY_NAME, "stripeerror");
        }
    }

    /**
     * {@code GET  /payments/status/:paymentIntentId} : Get payment intent status
     *
     * @param paymentIntentId the payment intent ID
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the payment status
     */
    @GetMapping("/status/{paymentIntentId}")
    public ResponseEntity<PaymentIntentResponse> getPaymentStatus(@PathVariable String paymentIntentId) {
        log.debug("REST request to get payment status : {}", paymentIntentId);

        try {
            PaymentIntent paymentIntent = stripeService.retrievePaymentIntent(paymentIntentId);

            PaymentIntentResponse response = new PaymentIntentResponse();
            response.setPaymentIntentId(paymentIntent.getId());
            response.setAmount(stripeService.convertFromCents(paymentIntent.getAmount()));
            response.setCurrency(paymentIntent.getCurrency());
            response.setStatus(paymentIntent.getStatus());

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            log.error("Error retrieving payment status", e);
            throw new BadRequestAlertException("Failed to retrieve payment status: " + e.getMessage(), ENTITY_NAME, "stripeerror");
        }
    }
} 