package com.meet.singles.web.rest;

import com.meet.singles.domain.UserTestAnswer;
import com.meet.singles.repository.UserTestAnswerRepository;
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
 * REST controller for managing {@link com.meet.singles.domain.UserTestAnswer}.
 */
@RestController
@RequestMapping("/api/user-test-answers")
@Transactional
public class UserTestAnswerResource {

    private static final Logger LOG = LoggerFactory.getLogger(UserTestAnswerResource.class);

    private static final String ENTITY_NAME = "userTestAnswer";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserTestAnswerRepository userTestAnswerRepository;

    public UserTestAnswerResource(UserTestAnswerRepository userTestAnswerRepository) {
        this.userTestAnswerRepository = userTestAnswerRepository;
    }

    /**
     * {@code POST  /user-test-answers} : Create a new userTestAnswer.
     *
     * @param userTestAnswer the userTestAnswer to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new userTestAnswer, or with status {@code 400 (Bad Request)} if the userTestAnswer has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<UserTestAnswer> createUserTestAnswer(@Valid @RequestBody UserTestAnswer userTestAnswer)
        throws URISyntaxException {
        LOG.debug("REST request to save UserTestAnswer : {}", userTestAnswer);
        if (userTestAnswer.getId() != null) {
            throw new BadRequestAlertException("A new userTestAnswer cannot already have an ID", ENTITY_NAME, "idexists");
        }
        userTestAnswer = userTestAnswerRepository.save(userTestAnswer);
        return ResponseEntity.created(new URI("/api/user-test-answers/" + userTestAnswer.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, userTestAnswer.getId().toString()))
            .body(userTestAnswer);
    }

    /**
     * {@code PUT  /user-test-answers/:id} : Updates an existing userTestAnswer.
     *
     * @param id the id of the userTestAnswer to save.
     * @param userTestAnswer the userTestAnswer to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userTestAnswer,
     * or with status {@code 400 (Bad Request)} if the userTestAnswer is not valid,
     * or with status {@code 500 (Internal Server Error)} if the userTestAnswer couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserTestAnswer> updateUserTestAnswer(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody UserTestAnswer userTestAnswer
    ) throws URISyntaxException {
        LOG.debug("REST request to update UserTestAnswer : {}, {}", id, userTestAnswer);
        if (userTestAnswer.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userTestAnswer.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!userTestAnswerRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        userTestAnswer = userTestAnswerRepository.save(userTestAnswer);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userTestAnswer.getId().toString()))
            .body(userTestAnswer);
    }

    /**
     * {@code PATCH  /user-test-answers/:id} : Partial updates given fields of an existing userTestAnswer, field will ignore if it is null
     *
     * @param id the id of the userTestAnswer to save.
     * @param userTestAnswer the userTestAnswer to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userTestAnswer,
     * or with status {@code 400 (Bad Request)} if the userTestAnswer is not valid,
     * or with status {@code 404 (Not Found)} if the userTestAnswer is not found,
     * or with status {@code 500 (Internal Server Error)} if the userTestAnswer couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<UserTestAnswer> partialUpdateUserTestAnswer(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody UserTestAnswer userTestAnswer
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update UserTestAnswer partially : {}, {}", id, userTestAnswer);
        if (userTestAnswer.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userTestAnswer.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!userTestAnswerRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<UserTestAnswer> result = userTestAnswerRepository
            .findById(userTestAnswer.getId())
            .map(existingUserTestAnswer -> {
                if (userTestAnswer.getAnswerValue() != null) {
                    existingUserTestAnswer.setAnswerValue(userTestAnswer.getAnswerValue());
                }
                if (userTestAnswer.getTimestamp() != null) {
                    existingUserTestAnswer.setTimestamp(userTestAnswer.getTimestamp());
                }

                return existingUserTestAnswer;
            })
            .map(userTestAnswerRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userTestAnswer.getId().toString())
        );
    }

    /**
     * {@code GET  /user-test-answers} : get all the userTestAnswers.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of userTestAnswers in body.
     */
    @GetMapping("")
    public List<UserTestAnswer> getAllUserTestAnswers() {
        LOG.debug("REST request to get all UserTestAnswers");
        return userTestAnswerRepository.findAll();
    }

    /**
     * {@code GET  /user-test-answers/:id} : get the "id" userTestAnswer.
     *
     * @param id the id of the userTestAnswer to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the userTestAnswer, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserTestAnswer> getUserTestAnswer(@PathVariable("id") Long id) {
        LOG.debug("REST request to get UserTestAnswer : {}", id);
        Optional<UserTestAnswer> userTestAnswer = userTestAnswerRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(userTestAnswer);
    }

    /**
     * {@code DELETE  /user-test-answers/:id} : delete the "id" userTestAnswer.
     *
     * @param id the id of the userTestAnswer to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserTestAnswer(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete UserTestAnswer : {}", id);
        userTestAnswerRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
