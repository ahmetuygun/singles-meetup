package com.meet.singles.web.rest;

import com.meet.singles.domain.PersonProfile;
import com.meet.singles.repository.PersonProfileRepository;
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
 * REST controller for managing {@link com.meet.singles.domain.PersonProfile}.
 */
@RestController
@RequestMapping("/api/person-profiles")
@Transactional
public class PersonProfileResource {

    private static final Logger LOG = LoggerFactory.getLogger(PersonProfileResource.class);

    private static final String ENTITY_NAME = "personProfile";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PersonProfileRepository personProfileRepository;

    public PersonProfileResource(PersonProfileRepository personProfileRepository) {
        this.personProfileRepository = personProfileRepository;
    }

    /**
     * {@code POST  /person-profiles} : Create a new personProfile.
     *
     * @param personProfile the personProfile to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new personProfile, or with status {@code 400 (Bad Request)} if the personProfile has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PersonProfile> createPersonProfile(@Valid @RequestBody PersonProfile personProfile) throws URISyntaxException {
        LOG.debug("REST request to save PersonProfile : {}", personProfile);
        if (personProfile.getId() != null) {
            throw new BadRequestAlertException("A new personProfile cannot already have an ID", ENTITY_NAME, "idexists");
        }
        personProfile = personProfileRepository.save(personProfile);
        return ResponseEntity.created(new URI("/api/person-profiles/" + personProfile.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, personProfile.getId().toString()))
            .body(personProfile);
    }

    /**
     * {@code PUT  /person-profiles/:id} : Updates an existing personProfile.
     *
     * @param id the id of the personProfile to save.
     * @param personProfile the personProfile to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated personProfile,
     * or with status {@code 400 (Bad Request)} if the personProfile is not valid,
     * or with status {@code 500 (Internal Server Error)} if the personProfile couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PersonProfile> updatePersonProfile(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PersonProfile personProfile
    ) throws URISyntaxException {
        LOG.debug("REST request to update PersonProfile : {}, {}", id, personProfile);
        if (personProfile.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, personProfile.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!personProfileRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        personProfile = personProfileRepository.save(personProfile);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, personProfile.getId().toString()))
            .body(personProfile);
    }

    /**
     * {@code PATCH  /person-profiles/:id} : Partial updates given fields of an existing personProfile, field will ignore if it is null
     *
     * @param id the id of the personProfile to save.
     * @param personProfile the personProfile to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated personProfile,
     * or with status {@code 400 (Bad Request)} if the personProfile is not valid,
     * or with status {@code 404 (Not Found)} if the personProfile is not found,
     * or with status {@code 500 (Internal Server Error)} if the personProfile couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PersonProfile> partialUpdatePersonProfile(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PersonProfile personProfile
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update PersonProfile partially : {}, {}", id, personProfile);
        if (personProfile.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, personProfile.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!personProfileRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PersonProfile> result = personProfileRepository
            .findById(personProfile.getId())
            .map(existingPersonProfile -> {
                if (personProfile.getFirstName() != null) {
                    existingPersonProfile.setFirstName(personProfile.getFirstName());
                }
                if (personProfile.getLastName() != null) {
                    existingPersonProfile.setLastName(personProfile.getLastName());
                }
                if (personProfile.getDob() != null) {
                    existingPersonProfile.setDob(personProfile.getDob());
                }
                if (personProfile.getGender() != null) {
                    existingPersonProfile.setGender(personProfile.getGender());
                }
                if (personProfile.getBio() != null) {
                    existingPersonProfile.setBio(personProfile.getBio());
                }
                if (personProfile.getInterests() != null) {
                    existingPersonProfile.setInterests(personProfile.getInterests());
                }
                if (personProfile.getLocation() != null) {
                    existingPersonProfile.setLocation(personProfile.getLocation());
                }

                return existingPersonProfile;
            })
            .map(personProfileRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, personProfile.getId().toString())
        );
    }

    /**
     * {@code GET  /person-profiles} : get all the personProfiles.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of personProfiles in body.
     */
    @GetMapping("")
    public List<PersonProfile> getAllPersonProfiles(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all PersonProfiles");
        if (eagerload) {
            return personProfileRepository.findAllWithEagerRelationships();
        } else {
            return personProfileRepository.findAll();
        }
    }

    /**
     * {@code GET  /person-profiles/:id} : get the "id" personProfile.
     *
     * @param id the id of the personProfile to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the personProfile, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PersonProfile> getPersonProfile(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PersonProfile : {}", id);
        Optional<PersonProfile> personProfile = personProfileRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(personProfile);
    }

    /**
     * {@code DELETE  /person-profiles/:id} : delete the "id" personProfile.
     *
     * @param id the id of the personProfile to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePersonProfile(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PersonProfile : {}", id);
        personProfileRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
