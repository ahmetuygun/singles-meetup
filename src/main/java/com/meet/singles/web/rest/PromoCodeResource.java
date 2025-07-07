package com.meet.singles.web.rest;

import com.meet.singles.domain.PromoCode;
import com.meet.singles.service.PromoCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/promo-codes")
public class PromoCodeResource {

    private final PromoCodeService promoCodeService;

    public PromoCodeResource(PromoCodeService promoCodeService) {
        this.promoCodeService = promoCodeService;
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validatePromoCode(@RequestBody PromoCodeValidationRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            PromoCodeService.PromoCodeValidationResult result = promoCodeService.validatePromoCode(
                request.getCode(),
                request.getEventId(),
                request.getTotalAmount()
            );

            response.put("valid", result.isValid());
            response.put("message", result.getMessage());
            
            if (result.isValid() && result.getPromoCode() != null) {
                response.put("promoCode", convertToMap(result.getPromoCode()));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("valid", false);
            response.put("message", "Error validating promo code: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private Map<String, Object> convertToMap(PromoCode promoCode) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", promoCode.getId());
        map.put("code", promoCode.getCode());
        map.put("type", promoCode.getType());
        map.put("value", promoCode.getValue());
        map.put("maxUses", promoCode.getMaxUses());
        map.put("usedCount", promoCode.getUsedCount());
        map.put("expiresAt", promoCode.getExpiresAt());
        map.put("isActive", promoCode.getIsActive());
        
        if (promoCode.getEvent() != null) {
            map.put("eventId", promoCode.getEvent().getId());
        }
        
        return map;
    }

    public static class PromoCodeValidationRequest {
        private String code;
        private Long eventId;
        private BigDecimal totalAmount;

        // Getters and Setters
        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public Long getEventId() {
            return eventId;
        }

        public void setEventId(Long eventId) {
            this.eventId = eventId;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }
    }
} 