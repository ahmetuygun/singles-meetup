package com.meet.singles.web.rest;

import com.meet.singles.domain.UserTicket;
import com.meet.singles.domain.UserEvent;
import com.meet.singles.domain.PersonProfile;
import com.meet.singles.domain.Ticket;
import com.meet.singles.domain.Event;
import com.meet.singles.domain.enumeration.PaymentStatus;
import com.meet.singles.repository.UserTicketRepository;
import com.meet.singles.repository.UserEventRepository;
import com.meet.singles.repository.PersonProfileRepository;
import com.meet.singles.repository.TicketRepository;
import com.meet.singles.security.SecurityUtils;
import com.meet.singles.service.QrCodeService;
import com.meet.singles.web.rest.errors.BadRequestAlertException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.meet.singles.domain.UserTicket}.
 */
@RestController
@RequestMapping("/api/user-tickets")
@Transactional
public class UserTicketResource {

    private final Logger log = LoggerFactory.getLogger(UserTicketResource.class);

    private static final String ENTITY_NAME = "userTicket";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserTicketRepository userTicketRepository;
    private final UserEventRepository userEventRepository;
    private final PersonProfileRepository personProfileRepository;
    private final TicketRepository ticketRepository;
    private final QrCodeService qrCodeService;

    public UserTicketResource(
        UserTicketRepository userTicketRepository,
        UserEventRepository userEventRepository,
        PersonProfileRepository personProfileRepository,
        TicketRepository ticketRepository,
        QrCodeService qrCodeService
    ) {
        this.userTicketRepository = userTicketRepository;
        this.userEventRepository = userEventRepository;
        this.personProfileRepository = personProfileRepository;
        this.ticketRepository = ticketRepository;
        this.qrCodeService = qrCodeService;
    }

    /**
     * {@code POST  /user-tickets/purchase} : Purchase tickets.
     *
     * @param purchaseRequest the purchase request containing ticket selections.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new user tickets.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/purchase")
    public ResponseEntity<List<UserTicket>> purchaseTickets(@RequestBody PurchaseRequest purchaseRequest) throws URISyntaxException {
        log.debug("REST request to purchase tickets : {}", purchaseRequest);
        
        String currentUserLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("User not authenticated", ENTITY_NAME, "notauthenticated"));
        
        PersonProfile personProfile = personProfileRepository.findByInternalUserLogin(currentUserLogin)
            .orElseThrow(() -> new BadRequestAlertException("Person profile not found", ENTITY_NAME, "profilenotfound"));

        // Track unique events for UserEvent creation
        Set<Event> uniqueEvents = new HashSet<>();
        
        List<UserTicket> userTickets = purchaseRequest.getTicketSelections().stream()
            .map(selection -> {
                Ticket ticket = ticketRepository.findById(selection.getTicketId())
                    .orElseThrow(() -> new BadRequestAlertException("Ticket not found", ENTITY_NAME, "ticketnotfound"));
                
                // Track the event for UserEvent creation
                if (ticket.getEvent() != null) {
                    uniqueEvents.add(ticket.getEvent());
                }
                
                BigDecimal totalPrice = ticket.getPrice().multiply(BigDecimal.valueOf(selection.getQuantity()));
                BigDecimal bookingFee = totalPrice.multiply(BigDecimal.valueOf(0.1)); // 10% booking fee
                
                UserTicket userTicket = new UserTicket();
                userTicket.setPersonProfile(personProfile);
                userTicket.setTicket(ticket);
                userTicket.setQuantity(selection.getQuantity());
                userTicket.setTotalPrice(totalPrice);
                userTicket.setBookingFee(bookingFee);
                userTicket.setPaymentStatus(PaymentStatus.PAID);
                userTicket.setPaymentMethod(purchaseRequest.getPaymentMethod());
                userTicket.setPurchaseDate(ZonedDateTime.now());
                userTicket.setTicketCode(UUID.randomUUID().toString());
                userTicket.setUsed(false);
                
                return userTicketRepository.save(userTicket);
            })
            .toList();

        // Create UserEvent records for each unique event (if not already exists)
        for (Event event : uniqueEvents) {
            Optional<UserEvent> existingUserEvent = userEventRepository.findByPersonProfileAndEvent(personProfile, event);
            if (existingUserEvent.isEmpty()) {
                // Find the ticket code for this event from the purchased tickets
                String ticketCode = userTickets.stream()
                    .filter(ut -> ut.getTicket().getEvent().getId().equals(event.getId()))
                    .findFirst()
                    .map(UserTicket::getTicketCode)
                    .orElse(UUID.randomUUID().toString());
                
                // Generate QR code for the ticket
                String qrCode = qrCodeService.generateTicketQrCode(ticketCode, event.getId(), personProfile.getId());
                
                UserEvent userEvent = new UserEvent();
                userEvent.setPersonProfile(personProfile);
                userEvent.setEvent(event);
                userEvent.setStatus("REGISTERED");
                userEvent.setCheckedIn(false);
                userEvent.setMatchCompleted(false);
                userEvent.setPaymentStatus(PaymentStatus.PAID);
                userEvent.setQrCode(qrCode);
                userEventRepository.save(userEvent);
                log.debug("Created UserEvent with QR code for person {} and event {}", personProfile.getId(), event.getId());
            } else {
                log.debug("UserEvent already exists for person {} and event {}", personProfile.getId(), event.getId());
                
                // Update existing UserEvent with QR code if it doesn't have one
                UserEvent userEvent = existingUserEvent.get();
                if (userEvent.getQrCode() == null) {
                    // Find the ticket code for this event from the purchased tickets
                    String ticketCode = userTickets.stream()
                        .filter(ut -> ut.getTicket().getEvent().getId().equals(event.getId()))
                        .findFirst()
                        .map(UserTicket::getTicketCode)
                        .orElse(UUID.randomUUID().toString());
                    
                    // Generate QR code for the ticket
                    String qrCode = qrCodeService.generateTicketQrCode(ticketCode, event.getId(), personProfile.getId());
                    userEvent.setQrCode(qrCode);
                    userEventRepository.save(userEvent);
                    log.debug("Updated existing UserEvent with QR code for person {} and event {}", personProfile.getId(), event.getId());
                }
            }
        }

        return ResponseEntity.ok(userTickets);
    }

    /**
     * {@code GET  /user-tickets/my-tickets} : get current user's tickets.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of user tickets in body.
     */
    @GetMapping("/my-tickets")
    public List<UserTicket> getMyTickets() {
        log.debug("REST request to get current user's tickets");
        
        String currentUserLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("User not authenticated", ENTITY_NAME, "notauthenticated"));
        
        PersonProfile personProfile = personProfileRepository.findByInternalUserLogin(currentUserLogin)
            .orElseThrow(() -> new BadRequestAlertException("Person profile not found", ENTITY_NAME, "profilenotfound"));

        List<UserTicket> userTickets = userTicketRepository.findByPersonProfileIdWithTicketAndEvent(personProfile.getId());
        
        // Debug log to check if event information is loaded
        for (UserTicket userTicket : userTickets) {
            log.info("UserTicket: {}, Ticket: {}, Event: {}", 
                userTicket.getId(), 
                userTicket.getTicket() != null ? userTicket.getTicket().getName() : "null",
                userTicket.getTicket() != null && userTicket.getTicket().getEvent() != null ? userTicket.getTicket().getEvent().getName() : "null");
        }
        
        return userTickets;
    }

    /**
     * {@code GET  /user-tickets} : get all the user tickets.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of user tickets in body.
     */
    @GetMapping("")
    public List<UserTicket> getAllUserTickets() {
        log.debug("REST request to get all UserTickets");
        return userTicketRepository.findAll();
    }

    /**
     * {@code GET  /user-tickets/:id} : get the "id" user ticket.
     *
     * @param id the id of the user ticket to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the user ticket, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserTicket> getUserTicket(@PathVariable Long id) {
        log.debug("REST request to get UserTicket : {}", id);
        Optional<UserTicket> userTicket = userTicketRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(userTicket);
    }

    // DTOs for request/response
    public static class PurchaseRequest {
        private List<TicketSelection> ticketSelections;
        private String paymentMethod;

        public List<TicketSelection> getTicketSelections() {
            return ticketSelections;
        }

        public void setTicketSelections(List<TicketSelection> ticketSelections) {
            this.ticketSelections = ticketSelections;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }
    }

    public static class TicketSelection {
        private Long ticketId;
        private Integer quantity;

        public Long getTicketId() {
            return ticketId;
        }

        public void setTicketId(Long ticketId) {
            this.ticketId = ticketId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
} 