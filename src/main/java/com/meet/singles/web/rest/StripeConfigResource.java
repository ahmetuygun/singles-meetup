package com.meet.singles.web.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
public class StripeConfigResource {

    private final Logger log = LoggerFactory.getLogger(StripeConfigResource.class);

    @Value("${stripe.publishable-key}")
    private String publishableKey;

    /**
     * {@code GET  /stripe/config} : Get Stripe configuration for frontend
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the Stripe config
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getStripeConfig() {
        log.debug("REST request to get Stripe configuration");
        
        Map<String, String> config = new HashMap<>();
        config.put("publishableKey", publishableKey);
        
        return ResponseEntity.ok(config);
    }
} 