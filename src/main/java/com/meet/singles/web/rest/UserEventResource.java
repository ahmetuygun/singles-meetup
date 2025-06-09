package com.meet.singles.web.rest;

import com.meet.singles.domain.UserEvent;
import com.meet.singles.repository.UserEventRepository;
import com.meet.singles.security.SecurityUtils;
import com.meet.singles.service.QrCodeService;
import com.meet.singles.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.meet.singles.domain.UserEvent}.
 */
@RestController
@RequestMapping("/api/user-events")
@Transactional
public class UserEventResource {

    private static final Logger LOG = LoggerFactory.getLogger(UserEventResource.class);

    private static final String ENTITY_NAME = "userEvent";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserEventRepository userEventRepository;
    private final QrCodeService qrCodeService;

    public UserEventResource(UserEventRepository userEventRepository, QrCodeService qrCodeService) {
        this.userEventRepository = userEventRepository;
        this.qrCodeService = qrCodeService;
    }

    /**
     * {@code POST  /user-events} : Create a new userEvent.
     *
     * @param userEvent the userEvent to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new userEvent, or with status {@code 400 (Bad Request)} if the userEvent has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<UserEvent> createUserEvent(@Valid @RequestBody UserEvent userEvent) throws URISyntaxException {
        LOG.debug("REST request to save UserEvent : {}", userEvent);
        if (userEvent.getId() != null) {
            throw new BadRequestAlertException("A new userEvent cannot already have an ID", ENTITY_NAME, "idexists");
        }
        userEvent = userEventRepository.save(userEvent);
        return ResponseEntity.created(new URI("/api/user-events/" + userEvent.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, userEvent.getId().toString()))
            .body(userEvent);
    }

    /**
     * {@code PUT  /user-events/:id} : Updates an existing userEvent.
     *
     * @param id the id of the userEvent to save.
     * @param userEvent the userEvent to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userEvent,
     * or with status {@code 400 (Bad Request)} if the userEvent is not valid,
     * or with status {@code 500 (Internal Server Error)} if the userEvent couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserEvent> updateUserEvent(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody UserEvent userEvent
    ) throws URISyntaxException {
        LOG.debug("REST request to update UserEvent : {}, {}", id, userEvent);
        if (userEvent.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userEvent.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!userEventRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        userEvent = userEventRepository.save(userEvent);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userEvent.getId().toString()))
            .body(userEvent);
    }

    /**
     * {@code PATCH  /user-events/:id} : Partial updates given fields of an existing userEvent, field will ignore if it is null
     *
     * @param id the id of the userEvent to save.
     * @param userEvent the userEvent to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userEvent,
     * or with status {@code 400 (Bad Request)} if the userEvent is not valid,
     * or with status {@code 404 (Not Found)} if the userEvent is not found,
     * or with status {@code 500 (Internal Server Error)} if the userEvent couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<UserEvent> partialUpdateUserEvent(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody UserEvent userEvent
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update UserEvent partially : {}, {}", id, userEvent);
        if (userEvent.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userEvent.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!userEventRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<UserEvent> result = userEventRepository
            .findById(userEvent.getId())
            .map(existingUserEvent -> {
                if (userEvent.getStatus() != null) {
                    existingUserEvent.setStatus(userEvent.getStatus());
                }
                if (userEvent.getCheckedIn() != null) {
                    existingUserEvent.setCheckedIn(userEvent.getCheckedIn());
                }
                if (userEvent.getMatchCompleted() != null) {
                    existingUserEvent.setMatchCompleted(userEvent.getMatchCompleted());
                }
                if (userEvent.getPaymentStatus() != null) {
                    existingUserEvent.setPaymentStatus(userEvent.getPaymentStatus());
                }

                return existingUserEvent;
            })
            .map(userEventRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userEvent.getId().toString())
        );
    }

    /**
     * {@code GET  /user-events} : get all the userEvents.
     *
     * @param eventId optional filter by event ID
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of userEvents in body.
     */
    @GetMapping("")
    public List<UserEvent> getAllUserEvents(@RequestParam(required = false) Long eventId) {
        LOG.debug("REST request to get all UserEvents");
        if (eventId != null) {
            LOG.debug("Filtering UserEvents by event ID: {}", eventId);
            return userEventRepository.findByEventIdWithPersonProfile(eventId);
        }
        return userEventRepository.findAllWithEvent();
    }

    /**
     * {@code GET  /user-events/:id} : get the "id" userEvent.
     *
     * @param id the id of the userEvent to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the userEvent, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserEvent> getUserEvent(@PathVariable("id") Long id) {
        LOG.debug("REST request to get UserEvent : {}", id);
        Optional<UserEvent> userEvent = userEventRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(userEvent);
    }

    /**
     * {@code DELETE  /user-events/:id} : delete the "id" userEvent.
     *
     * @param id the id of the userEvent to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserEvent(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete UserEvent : {}", id);
        userEventRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /**
     * {@code POST  /user-events/generate-missing-qr} : Generate QR codes for UserEvents that don't have them.
     *
     * @return the {@link ResponseEntity} with the count of updated UserEvents.
     */
    @PostMapping("/generate-missing-qr")
    public ResponseEntity<String> generateMissingQrCodes() {
        LOG.debug("REST request to generate missing QR codes");
        
        List<UserEvent> userEventsWithoutQr = userEventRepository.findAllWithEvent().stream()
            .filter(ue -> ue.getQrCode() == null && ue.getEvent() != null && ue.getPersonProfile() != null)
            .toList();
        
        int updatedCount = 0;
        for (UserEvent userEvent : userEventsWithoutQr) {
            try {
                // Generate a unique ticket code for this UserEvent
                String ticketCode = java.util.UUID.randomUUID().toString();
                String qrCode = qrCodeService.generateTicketQrCode(
                    ticketCode, 
                    userEvent.getEvent().getId(), 
                    userEvent.getPersonProfile().getId()
                );
                userEvent.setQrCode(qrCode);
                userEventRepository.save(userEvent);
                updatedCount++;
                LOG.debug("Generated QR code for UserEvent {}", userEvent.getId());
            } catch (Exception e) {
                LOG.error("Failed to generate QR code for UserEvent {}: {}", userEvent.getId(), e.getMessage());
            }
        }
        
        return ResponseEntity.ok(String.format("Generated QR codes for %d UserEvents", updatedCount));
    }

    /**
     * {@code POST  /user-events/validate-qr} : Validate QR code and check in user.
     *
     * @param request the QR code validation request.
     * @return the {@link ResponseEntity} with validation result.
     */
    @PostMapping("/validate-qr")
    public ResponseEntity<QrValidationResponse> validateQrCode(@RequestBody QrValidationRequest request) {
        LOG.debug("REST request to validate QR code: {}", request.getQrData());
        
        try {
            // Parse QR code data: TICKET:ticketCode:EVENT:eventId:USER:userId
            String[] parts = request.getQrData().split(":");
            if (parts.length != 6 || !parts[0].equals("TICKET") || !parts[2].equals("EVENT") || !parts[4].equals("USER")) {
                return ResponseEntity.ok(new QrValidationResponse(false, "Invalid QR code format", null));
            }
            
            String ticketCode = parts[1];
            Long eventId = Long.parseLong(parts[3]);
            Long userId = Long.parseLong(parts[5]);
            
            // Find the UserEvent
            List<UserEvent> userEvents = userEventRepository.findByEventIdWithPersonProfile(eventId);
            Optional<UserEvent> userEventOpt = userEvents.stream()
                .filter(ue -> ue.getPersonProfile().getId().equals(userId))
                .findFirst();
            
            if (userEventOpt.isEmpty()) {
                return ResponseEntity.ok(new QrValidationResponse(false, "User not registered for this event", null));
            }
            
            UserEvent userEvent = userEventOpt.get();
            
            // Check if already checked in
            if (Boolean.TRUE.equals(userEvent.getCheckedIn())) {
                return ResponseEntity.ok(new QrValidationResponse(false, "User already checked in", userEvent));
            }
            
            // Check in the user
            userEvent.setCheckedIn(true);
            userEventRepository.save(userEvent);
            
            LOG.debug("Successfully checked in user {} for event {}", userId, eventId);
            return ResponseEntity.ok(new QrValidationResponse(true, "Check-in successful", userEvent));
            
        } catch (Exception e) {
            LOG.error("Error validating QR code", e);
            return ResponseEntity.ok(new QrValidationResponse(false, "Error validating QR code: " + e.getMessage(), null));
        }
    }

    // DTOs for QR validation
    public static class QrValidationRequest {
        private String qrData;

        public String getQrData() {
            return qrData;
        }

        public void setQrData(String qrData) {
            this.qrData = qrData;
        }
    }

    public static class QrValidationResponse {
        private boolean valid;
        private String message;
        private UserEvent userEvent;

        public QrValidationResponse(boolean valid, String message, UserEvent userEvent) {
            this.valid = valid;
            this.message = message;
            this.userEvent = userEvent;
        }

        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public UserEvent getUserEvent() {
            return userEvent;
        }

        public void setUserEvent(UserEvent userEvent) {
            this.userEvent = userEvent;
        }
    }
}
