package com.meet.singles.web.rest;

import com.meet.singles.domain.TestAnswerOption;
import com.meet.singles.repository.TestAnswerOptionRepository;
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
 * REST controller for managing {@link com.meet.singles.domain.TestAnswerOption}.
 */
@RestController
@RequestMapping("/api/test-answer-options")
@Transactional
public class TestAnswerOptionResource {

    private static final Logger LOG = LoggerFactory.getLogger(TestAnswerOptionResource.class);

    private static final String ENTITY_NAME = "testAnswerOption";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TestAnswerOptionRepository testAnswerOptionRepository;

    public TestAnswerOptionResource(TestAnswerOptionRepository testAnswerOptionRepository) {
        this.testAnswerOptionRepository = testAnswerOptionRepository;
    }

    /**
     * {@code POST  /test-answer-options} : Create a new testAnswerOption.
     *
     * @param testAnswerOption the testAnswerOption to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new testAnswerOption, or with status {@code 400 (Bad Request)} if the testAnswerOption has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<TestAnswerOption> createTestAnswerOption(@Valid @RequestBody TestAnswerOption testAnswerOption)
        throws URISyntaxException {
        LOG.debug("REST request to save TestAnswerOption : {}", testAnswerOption);
        if (testAnswerOption.getId() != null) {
            throw new BadRequestAlertException("A new testAnswerOption cannot already have an ID", ENTITY_NAME, "idexists");
        }
        testAnswerOption = testAnswerOptionRepository.save(testAnswerOption);
        return ResponseEntity.created(new URI("/api/test-answer-options/" + testAnswerOption.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, testAnswerOption.getId().toString()))
            .body(testAnswerOption);
    }

    /**
     * {@code PUT  /test-answer-options/:id} : Updates an existing testAnswerOption.
     *
     * @param id the id of the testAnswerOption to save.
     * @param testAnswerOption the testAnswerOption to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated testAnswerOption,
     * or with status {@code 400 (Bad Request)} if the testAnswerOption is not valid,
     * or with status {@code 500 (Internal Server Error)} if the testAnswerOption couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TestAnswerOption> updateTestAnswerOption(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TestAnswerOption testAnswerOption
    ) throws URISyntaxException {
        LOG.debug("REST request to update TestAnswerOption : {}, {}", id, testAnswerOption);
        if (testAnswerOption.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, testAnswerOption.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!testAnswerOptionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        testAnswerOption = testAnswerOptionRepository.save(testAnswerOption);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, testAnswerOption.getId().toString()))
            .body(testAnswerOption);
    }

    /**
     * {@code PATCH  /test-answer-options/:id} : Partial updates given fields of an existing testAnswerOption, field will ignore if it is null
     *
     * @param id the id of the testAnswerOption to save.
     * @param testAnswerOption the testAnswerOption to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated testAnswerOption,
     * or with status {@code 400 (Bad Request)} if the testAnswerOption is not valid,
     * or with status {@code 404 (Not Found)} if the testAnswerOption is not found,
     * or with status {@code 500 (Internal Server Error)} if the testAnswerOption couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TestAnswerOption> partialUpdateTestAnswerOption(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TestAnswerOption testAnswerOption
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update TestAnswerOption partially : {}, {}", id, testAnswerOption);
        if (testAnswerOption.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, testAnswerOption.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!testAnswerOptionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TestAnswerOption> result = testAnswerOptionRepository
            .findById(testAnswerOption.getId())
            .map(existingTestAnswerOption -> {
                if (testAnswerOption.getOptionText() != null) {
                    existingTestAnswerOption.setOptionText(testAnswerOption.getOptionText());
                }
                if (testAnswerOption.getValue() != null) {
                    existingTestAnswerOption.setValue(testAnswerOption.getValue());
                }

                return existingTestAnswerOption;
            })
            .map(testAnswerOptionRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, testAnswerOption.getId().toString())
        );
    }

    /**
     * {@code GET  /test-answer-options} : get all the testAnswerOptions.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of testAnswerOptions in body.
     */
    @GetMapping("")
    public List<TestAnswerOption> getAllTestAnswerOptions() {
        LOG.debug("REST request to get all TestAnswerOptions");
        return testAnswerOptionRepository.findAll();
    }

    /**
     * {@code GET  /test-answer-options/:id} : get the "id" testAnswerOption.
     *
     * @param id the id of the testAnswerOption to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the testAnswerOption, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TestAnswerOption> getTestAnswerOption(@PathVariable("id") Long id) {
        LOG.debug("REST request to get TestAnswerOption : {}", id);
        Optional<TestAnswerOption> testAnswerOption = testAnswerOptionRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(testAnswerOption);
    }

    /**
     * {@code DELETE  /test-answer-options/:id} : delete the "id" testAnswerOption.
     *
     * @param id the id of the testAnswerOption to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestAnswerOption(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete TestAnswerOption : {}", id);
        testAnswerOptionRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
