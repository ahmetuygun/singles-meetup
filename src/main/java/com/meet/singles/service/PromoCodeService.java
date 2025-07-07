package com.meet.singles.service;

import com.meet.singles.domain.PromoCode;
import com.meet.singles.domain.enumeration.PromoCodeType;
import com.meet.singles.repository.PromoCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PromoCodeService {

    private final PromoCodeRepository promoCodeRepository;

    public PromoCodeService(PromoCodeRepository promoCodeRepository) {
        this.promoCodeRepository = promoCodeRepository;
    }

    public PromoCodeValidationResult validatePromoCode(String code, Long eventId, BigDecimal totalAmount) {
        // Find the promo code
        Optional<PromoCode> promoCodeOpt = promoCodeRepository.findByCodeIgnoreCase(code);
        
        if (promoCodeOpt.isEmpty()) {
            return new PromoCodeValidationResult(false, "Promo code not found", null);
        }

        PromoCode promoCode = promoCodeOpt.get();

        // Check if promo code is active
        if (!promoCode.getIsActive()) {
            return new PromoCodeValidationResult(false, "Promo code is not active", null);
        }

        // Check if promo code has expired
        if (promoCode.getExpiresAt() != null && promoCode.getExpiresAt().isBefore(ZonedDateTime.now())) {
            return new PromoCodeValidationResult(false, "Promo code has expired", null);
        }

        // Check if promo code has reached maximum uses
        if (promoCode.getUsedCount() >= promoCode.getMaxUses()) {
            return new PromoCodeValidationResult(false, "Promo code has reached its maximum usage limit", null);
        }

        // Check if promo code is event-specific and matches the current event
        if (promoCode.getEvent() != null && !promoCode.getEvent().getId().equals(eventId)) {
            return new PromoCodeValidationResult(false, "Promo code is not valid for this event", null);
        }

        // Calculate discount amount
        BigDecimal discountAmount = calculateDiscount(promoCode, totalAmount);

        return new PromoCodeValidationResult(true, "Promo code applied successfully", promoCode);
    }

    private BigDecimal calculateDiscount(PromoCode promoCode, BigDecimal totalAmount) {
        switch (promoCode.getType()) {
            case PERCENTAGE:
                BigDecimal percentage = promoCode.getValue().divide(BigDecimal.valueOf(100));
                return totalAmount.multiply(percentage);
            case FIXED:
                return promoCode.getValue().min(totalAmount); // Don't discount more than total
            case FREE:
                return totalAmount; // Full discount
            default:
                return BigDecimal.ZERO;
        }
    }

    public void incrementUsageCount(UUID promoCodeId) {
        promoCodeRepository.findById(promoCodeId).ifPresent(promoCode -> {
            promoCode.setUsedCount(promoCode.getUsedCount() + 1);
            promoCodeRepository.save(promoCode);
        });
    }

    public static class PromoCodeValidationResult {
        private final boolean valid;
        private final String message;
        private final PromoCode promoCode;

        public PromoCodeValidationResult(boolean valid, String message, PromoCode promoCode) {
            this.valid = valid;
            this.message = message;
            this.promoCode = promoCode;
        }

        public boolean isValid() {
            return valid;
        }

        public String getMessage() {
            return message;
        }

        public PromoCode getPromoCode() {
            return promoCode;
        }
    }
} 