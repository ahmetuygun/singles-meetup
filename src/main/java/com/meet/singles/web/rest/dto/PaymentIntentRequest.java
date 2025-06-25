package com.meet.singles.web.rest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class PaymentIntentRequest {
    
    @NotNull
    @Positive
    private BigDecimal amount;
    
    @NotNull
    @Positive
    private BigDecimal bookingFee;
    
    @NotNull
    @Size(min = 3, max = 3)
    private String currency;
    
    @NotNull
    private String userId;
    
    @NotNull
    private String eventId;
    
    @NotNull
    private String ticketId;
    
    @NotNull
    @Positive
    private Integer quantity;

    // Constructors
    public PaymentIntentRequest() {}

    public PaymentIntentRequest(BigDecimal amount, BigDecimal bookingFee, String currency, String userId, 
                               String eventId, String ticketId, Integer quantity) {
        this.amount = amount;
        this.bookingFee = bookingFee;
        this.currency = currency;
        this.userId = userId;
        this.eventId = eventId;
        this.ticketId = ticketId;
        this.quantity = quantity;
    }

    // Getters and Setters
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getBookingFee() {
        return bookingFee;
    }

    public void setBookingFee(BigDecimal bookingFee) {
        this.bookingFee = bookingFee;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    @Override
    public String toString() {
        return "PaymentIntentRequest{" +
                "amount=" + amount +
                ", bookingFee=" + bookingFee +
                ", currency='" + currency + '\'' +
                ", userId='" + userId + '\'' +
                ", eventId='" + eventId + '\'' +
                ", ticketId='" + ticketId + '\'' +
                ", quantity=" + quantity +
                '}';
    }
} 