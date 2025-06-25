package com.meet.singles.web.rest;

import com.meet.singles.service.StripeWebhookService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/webhooks")
public class StripeWebhookResource {

    private final Logger log = LoggerFactory.getLogger(StripeWebhookResource.class);

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    private final StripeWebhookService stripeWebhookService;

    public StripeWebhookResource(StripeWebhookService stripeWebhookService) {
        this.stripeWebhookService = stripeWebhookService;
    }

    /**
     * Handle Stripe webhook events
     * @param payload Raw webhook payload
     * @param sigHeader Stripe signature header
     * @return Response status
     */
    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        log.debug("Received Stripe webhook");
        
        Event event;
        
        try {
            // Verify webhook signature for security
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid signature for webhook: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error processing webhook");
        }

        // Handle the event
        try {
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    stripeWebhookService.handlePaymentIntentSucceeded(event);
                    break;
                case "payment_intent.payment_failed":
                    stripeWebhookService.handlePaymentIntentFailed(event);
                    break;
                case "payment_intent.requires_action":
                    stripeWebhookService.handlePaymentIntentRequiresAction(event);
                    break;
                case "payment_intent.canceled":
                    stripeWebhookService.handlePaymentIntentCanceled(event);
                    break;
                default:
                    log.debug("Unhandled event type: {}", event.getType());
            }
        } catch (Exception e) {
            log.error("Error handling webhook event {}: {}", event.getType(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error handling event");
        }

        return ResponseEntity.ok("Webhook handled successfully");
    }
} 