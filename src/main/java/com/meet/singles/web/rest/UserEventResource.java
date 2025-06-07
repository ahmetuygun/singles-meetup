package com.meet.singles.web.rest;

import com.meet.singles.domain.UserEvent;
import com.meet.singles.repository.UserEventRepository;
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

    public UserEventResource(UserEventRepository userEventRepository) {
        this.userEventRepository = userEventRepository;
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
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of userEvents in body.
     */
    @GetMapping("")
    public List<UserEvent> getAllUserEvents() {
        LOG.debug("REST request to get all UserEvents");
        return userEventRepository.findAll();
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
}
