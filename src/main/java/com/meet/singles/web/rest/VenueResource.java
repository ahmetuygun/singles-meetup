package com.meet.singles.web.rest;

import com.meet.singles.domain.Venue;
import com.meet.singles.repository.VenueRepository;
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
 * REST controller for managing {@link com.meet.singles.domain.Venue}.
 */
@RestController
@RequestMapping("/api/venues")
@Transactional
public class VenueResource {

    private static final Logger LOG = LoggerFactory.getLogger(VenueResource.class);

    private static final String ENTITY_NAME = "venue";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final VenueRepository venueRepository;

    public VenueResource(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    /**
     * {@code POST  /venues} : Create a new venue.
     *
     * @param venue the venue to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new venue, or with status {@code 400 (Bad Request)} if the venue has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<Venue> createVenue(@Valid @RequestBody Venue venue) throws URISyntaxException {
        LOG.debug("REST request to save Venue : {}", venue);
        if (venue.getId() != null) {
            throw new BadRequestAlertException("A new venue cannot already have an ID", ENTITY_NAME, "idexists");
        }
        venue = venueRepository.save(venue);
        return ResponseEntity.created(new URI("/api/venues/" + venue.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, venue.getId().toString()))
            .body(venue);
    }

    /**
     * {@code PUT  /venues/:id} : Updates an existing venue.
     *
     * @param id the id of the venue to save.
     * @param venue the venue to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated venue,
     * or with status {@code 400 (Bad Request)} if the venue is not valid,
     * or with status {@code 500 (Internal Server Error)} if the venue couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Venue> updateVenue(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody Venue venue)
        throws URISyntaxException {
        LOG.debug("REST request to update Venue : {}, {}", id, venue);
        if (venue.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, venue.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!venueRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        venue = venueRepository.save(venue);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, venue.getId().toString()))
            .body(venue);
    }

    /**
     * {@code PATCH  /venues/:id} : Partial updates given fields of an existing venue, field will ignore if it is null
     *
     * @param id the id of the venue to save.
     * @param venue the venue to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated venue,
     * or with status {@code 400 (Bad Request)} if the venue is not valid,
     * or with status {@code 404 (Not Found)} if the venue is not found,
     * or with status {@code 500 (Internal Server Error)} if the venue couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Venue> partialUpdateVenue(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Venue venue
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Venue partially : {}, {}", id, venue);
        if (venue.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, venue.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!venueRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Venue> result = venueRepository
            .findById(venue.getId())
            .map(existingVenue -> {
                if (venue.getName() != null) {
                    existingVenue.setName(venue.getName());
                }
                if (venue.getAddress() != null) {
                    existingVenue.setAddress(venue.getAddress());
                }
                if (venue.getCity() != null) {
                    existingVenue.setCity(venue.getCity());
                }
                if (venue.getCapacity() != null) {
                    existingVenue.setCapacity(venue.getCapacity());
                }
                if (venue.getContactInfo() != null) {
                    existingVenue.setContactInfo(venue.getContactInfo());
                }
                if (venue.getPhotoUrl() != null) {
                    existingVenue.setPhotoUrl(venue.getPhotoUrl());
                }

                return existingVenue;
            })
            .map(venueRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, venue.getId().toString())
        );
    }

    /**
     * {@code GET  /venues} : get all the venues.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of venues in body.
     */
    @GetMapping("")
    public List<Venue> getAllVenues() {
        LOG.debug("REST request to get all Venues");
        return venueRepository.findAll();
    }

    /**
     * {@code GET  /venues/:id} : get the "id" venue.
     *
     * @param id the id of the venue to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the venue, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenue(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Venue : {}", id);
        Optional<Venue> venue = venueRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(venue);
    }

    /**
     * {@code DELETE  /venues/:id} : delete the "id" venue.
     *
     * @param id the id of the venue to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Venue : {}", id);
        venueRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
