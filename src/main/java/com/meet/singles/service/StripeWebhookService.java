package com.meet.singles.service;

import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class StripeWebhookService {

    private final Logger log = LoggerFactory.getLogger(StripeWebhookService.class);

    /**
     * Handle successful payment intent
     * @param event Stripe webhook event
     */
    public void handlePaymentIntentSucceeded(Event event) {
        log.info("Payment intent succeeded: {}", event.getId());
        
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            log.info("Payment completed for payment intent: {}", paymentIntent.getId());
            
            // Extract metadata to identify the purchase
            String userId = paymentIntent.getMetadata().get("user_id");
            String eventId = paymentIntent.getMetadata().get("event_id");
            String ticketId = paymentIntent.getMetadata().get("ticket_id");
            String quantity = paymentIntent.getMetadata().get("quantity");
            
            // TODO: Update user ticket status to COMPLETED
            // This would typically involve:
            // 1. Find the pending UserTicket record
            // 2. Update status to COMPLETED
            // 3. Update payment information
            log.info("Payment succeeded for user: {}, event: {}, ticket: {}, quantity: {}", 
                userId, eventId, ticketId, quantity);
        }
    }

    /**
     * Handle failed payment intent
     * @param event Stripe webhook event
     */
    public void handlePaymentIntentFailed(Event event) {
        log.warn("Payment intent failed: {}", event.getId());
        
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            String userId = paymentIntent.getMetadata().get("user_id");
            String eventId = paymentIntent.getMetadata().get("event_id");
            
            // TODO: Update user ticket status to FAILED
            // Send notification to user about failed payment
            log.warn("Payment failed for user: {}, event: {}", userId, eventId);
        }
    }

    /**
     * Handle payment intent requiring additional action
     * @param event Stripe webhook event
     */
    public void handlePaymentIntentRequiresAction(Event event) {
        log.info("Payment intent requires action: {}", event.getId());
        
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            String userId = paymentIntent.getMetadata().get("user_id");
            
            // TODO: Notify user that additional action is required (3D Secure, etc.)
            log.info("Payment requires action for user: {}", userId);
        }
    }

    /**
     * Handle canceled payment intent
     * @param event Stripe webhook event
     */
    public void handlePaymentIntentCanceled(Event event) {
        log.info("Payment intent canceled: {}", event.getId());
        
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            String userId = paymentIntent.getMetadata().get("user_id");
            String eventId = paymentIntent.getMetadata().get("event_id");
            
            // TODO: Update user ticket status to CANCELED
            // Release any reserved tickets
            log.info("Payment canceled for user: {}, event: {}", userId, eventId);
        }
    }
} 