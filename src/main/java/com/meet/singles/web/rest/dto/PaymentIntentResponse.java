package com.meet.singles.web.rest.dto;

import java.math.BigDecimal;

public class PaymentIntentResponse {
    
    private String paymentIntentId;
    private String clientSecret;
    private BigDecimal amount;
    private String currency;
    private String status;

    // Constructors
    public PaymentIntentResponse() {}

    public PaymentIntentResponse(String paymentIntentId, String clientSecret, BigDecimal amount, 
                                String currency, String status) {
        this.paymentIntentId = paymentIntentId;
        this.clientSecret = clientSecret;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
    }

    // Getters and Setters
    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "PaymentIntentResponse{" +
                "paymentIntentId='" + paymentIntentId + '\'' +
                ", clientSecret='" + clientSecret + '\'' +
                ", amount=" + amount +
                ", currency='" + currency + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
} 