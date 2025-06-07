package com.meet.singles.web.rest;

import com.meet.singles.domain.TestQuestion;
import com.meet.singles.repository.TestQuestionRepository;
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
 * REST controller for managing {@link com.meet.singles.domain.TestQuestion}.
 */
@RestController
@RequestMapping("/api/test-questions")
@Transactional
public class TestQuestionResource {

    private static final Logger LOG = LoggerFactory.getLogger(TestQuestionResource.class);

    private static final String ENTITY_NAME = "testQuestion";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TestQuestionRepository testQuestionRepository;

    public TestQuestionResource(TestQuestionRepository testQuestionRepository) {
        this.testQuestionRepository = testQuestionRepository;
    }

    /**
     * {@code POST  /test-questions} : Create a new testQuestion.
     *
     * @param testQuestion the testQuestion to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new testQuestion, or with status {@code 400 (Bad Request)} if the testQuestion has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<TestQuestion> createTestQuestion(@Valid @RequestBody TestQuestion testQuestion) throws URISyntaxException {
        LOG.debug("REST request to save TestQuestion : {}", testQuestion);
        if (testQuestion.getId() != null) {
            throw new BadRequestAlertException("A new testQuestion cannot already have an ID", ENTITY_NAME, "idexists");
        }
        testQuestion = testQuestionRepository.save(testQuestion);
        return ResponseEntity.created(new URI("/api/test-questions/" + testQuestion.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, testQuestion.getId().toString()))
            .body(testQuestion);
    }

    /**
     * {@code PUT  /test-questions/:id} : Updates an existing testQuestion.
     *
     * @param id the id of the testQuestion to save.
     * @param testQuestion the testQuestion to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated testQuestion,
     * or with status {@code 400 (Bad Request)} if the testQuestion is not valid,
     * or with status {@code 500 (Internal Server Error)} if the testQuestion couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TestQuestion> updateTestQuestion(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TestQuestion testQuestion
    ) throws URISyntaxException {
        LOG.debug("REST request to update TestQuestion : {}, {}", id, testQuestion);
        if (testQuestion.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, testQuestion.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!testQuestionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        testQuestion = testQuestionRepository.save(testQuestion);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, testQuestion.getId().toString()))
            .body(testQuestion);
    }

    /**
     * {@code PATCH  /test-questions/:id} : Partial updates given fields of an existing testQuestion, field will ignore if it is null
     *
     * @param id the id of the testQuestion to save.
     * @param testQuestion the testQuestion to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated testQuestion,
     * or with status {@code 400 (Bad Request)} if the testQuestion is not valid,
     * or with status {@code 404 (Not Found)} if the testQuestion is not found,
     * or with status {@code 500 (Internal Server Error)} if the testQuestion couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TestQuestion> partialUpdateTestQuestion(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TestQuestion testQuestion
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update TestQuestion partially : {}, {}", id, testQuestion);
        if (testQuestion.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, testQuestion.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!testQuestionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TestQuestion> result = testQuestionRepository
            .findById(testQuestion.getId())
            .map(existingTestQuestion -> {
                if (testQuestion.getQuestionText() != null) {
                    existingTestQuestion.setQuestionText(testQuestion.getQuestionText());
                }
                if (testQuestion.getQuestionType() != null) {
                    existingTestQuestion.setQuestionType(testQuestion.getQuestionType());
                }
                if (testQuestion.getStepNumber() != null) {
                    existingTestQuestion.setStepNumber(testQuestion.getStepNumber());
                }
                if (testQuestion.getIsRequired() != null) {
                    existingTestQuestion.setIsRequired(testQuestion.getIsRequired());
                }
                if (testQuestion.getCategory() != null) {
                    existingTestQuestion.setCategory(testQuestion.getCategory());
                }
                if (testQuestion.getLanguage() != null) {
                    existingTestQuestion.setLanguage(testQuestion.getLanguage());
                }

                return existingTestQuestion;
            })
            .map(testQuestionRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, testQuestion.getId().toString())
        );
    }

    /**
     * {@code GET  /test-questions} : get all the testQuestions.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of testQuestions in body.
     */
    @GetMapping("")
    public List<TestQuestion> getAllTestQuestions() {
        LOG.debug("REST request to get all TestQuestions");
        return testQuestionRepository.findAll();
    }

    /**
     * {@code GET  /test-questions/:id} : get the "id" testQuestion.
     *
     * @param id the id of the testQuestion to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the testQuestion, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TestQuestion> getTestQuestion(@PathVariable("id") Long id) {
        LOG.debug("REST request to get TestQuestion : {}", id);
        Optional<TestQuestion> testQuestion = testQuestionRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(testQuestion);
    }

    /**
     * {@code DELETE  /test-questions/:id} : delete the "id" testQuestion.
     *
     * @param id the id of the testQuestion to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTestQuestion(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete TestQuestion : {}", id);
        testQuestionRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
