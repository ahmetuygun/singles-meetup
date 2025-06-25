package com.meet.singles.web.rest.dto;

import jakarta.validation.constraints.NotNull;

public class ConfirmPaymentRequest {
    
    @NotNull
    private String paymentIntentId;
    
    private String paymentMethodId; // Optional for wallet payments

    // Constructors
    public ConfirmPaymentRequest() {}

    public ConfirmPaymentRequest(String paymentIntentId, String paymentMethodId) {
        this.paymentIntentId = paymentIntentId;
        this.paymentMethodId = paymentMethodId;
    }

    // Getters and Setters
    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    public String getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }

    @Override
    public String toString() {
        return "ConfirmPaymentRequest{" +
                "paymentIntentId='" + paymentIntentId + '\'' +
                ", paymentMethodId='" + paymentMethodId + '\'' +
                '}';
    }
} 