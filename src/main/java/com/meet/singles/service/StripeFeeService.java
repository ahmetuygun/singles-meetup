package com.meet.singles.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeFeeService {

    private final Logger log = LoggerFactory.getLogger(StripeFeeService.class);

    @Value("${stripe.fee.percentage:1.5}")
    private Double stripeFeePercentage;

    @Value("${stripe.fee.constant:0.25}")
    private Double stripeFeeConstant;

    /**
     * Calculate Stripe processing fee for a given amount
     * @param amount The amount to calculate fee for
     * @return The calculated fee amount
     */
    public BigDecimal calculateStripeFee(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // Calculate percentage fee
        BigDecimal percentageFee = amount.multiply(BigDecimal.valueOf(stripeFeePercentage / 100));
        
        // Add constant fee
        BigDecimal totalFee = percentageFee.add(BigDecimal.valueOf(stripeFeeConstant));
        
        // Round to 2 decimal places
        totalFee = totalFee.setScale(2, RoundingMode.HALF_UP);
        
        log.debug("Calculated Stripe fee for amount {}: {} ({}% + €{})", 
            amount, totalFee, stripeFeePercentage, stripeFeeConstant);
        
        return totalFee;
    }

    /**
     * Get the configured Stripe fee percentage
     * @return The fee percentage
     */
    public Double getStripeFeePercentage() {
        return stripeFeePercentage;
    }

    /**
     * Get the configured Stripe fee constant
     * @return The fee constant
     */
    public Double getStripeFeeConstant() {
        return stripeFeeConstant;
    }
} 