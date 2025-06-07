package com.meet.singles.web.rest;

import static com.meet.singles.domain.TestQuestionAsserts.*;
import static com.meet.singles.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meet.singles.IntegrationTest;
import com.meet.singles.domain.TestQuestion;
import com.meet.singles.domain.enumeration.QuestionType;
import com.meet.singles.repository.TestQuestionRepository;
import jakarta.persistence.EntityManager;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link TestQuestionResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TestQuestionResourceIT {

    private static final String DEFAULT_QUESTION_TEXT = "AAAAAAAAAA";
    private static final String UPDATED_QUESTION_TEXT = "BBBBBBBBBB";

    private static final QuestionType DEFAULT_QUESTION_TYPE = QuestionType.SINGLE_CHOICE;
    private static final QuestionType UPDATED_QUESTION_TYPE = QuestionType.MULTIPLE_CHOICE;

    private static final Integer DEFAULT_STEP_NUMBER = 1;
    private static final Integer UPDATED_STEP_NUMBER = 2;

    private static final Boolean DEFAULT_IS_REQUIRED = false;
    private static final Boolean UPDATED_IS_REQUIRED = true;

    private static final String DEFAULT_CATEGORY = "AAAAAAAAAA";
    private static final String UPDATED_CATEGORY = "BBBBBBBBBB";

    private static final String DEFAULT_LANGUAGE = "AAAAAAAAAA";
    private static final String UPDATED_LANGUAGE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/test-questions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TestQuestionRepository testQuestionRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTestQuestionMockMvc;

    private TestQuestion testQuestion;

    private TestQuestion insertedTestQuestion;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TestQuestion createEntity() {
        return new TestQuestion()
            .questionText(DEFAULT_QUESTION_TEXT)
            .questionType(DEFAULT_QUESTION_TYPE)
            .stepNumber(DEFAULT_STEP_NUMBER)
            .isRequired(DEFAULT_IS_REQUIRED)
            .category(DEFAULT_CATEGORY)
            .language(DEFAULT_LANGUAGE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TestQuestion createUpdatedEntity() {
        return new TestQuestion()
            .questionText(UPDATED_QUESTION_TEXT)
            .questionType(UPDATED_QUESTION_TYPE)
            .stepNumber(UPDATED_STEP_NUMBER)
            .isRequired(UPDATED_IS_REQUIRED)
            .category(UPDATED_CATEGORY)
            .language(UPDATED_LANGUAGE);
    }

    @BeforeEach
    void initTest() {
        testQuestion = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedTestQuestion != null) {
            testQuestionRepository.delete(insertedTestQuestion);
            insertedTestQuestion = null;
        }
    }

    @Test
    @Transactional
    void createTestQuestion() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the TestQuestion
        var returnedTestQuestion = om.readValue(
            restTestQuestionMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testQuestion))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TestQuestion.class
        );

        // Validate the TestQuestion in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertTestQuestionUpdatableFieldsEquals(returnedTestQuestion, getPersistedTestQuestion(returnedTestQuestion));

        insertedTestQuestion = returnedTestQuestion;
    }

    @Test
    @Transactional
    void createTestQuestionWithExistingId() throws Exception {
        // Create the TestQuestion with an existing ID
        testQuestion.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTestQuestionMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testQuestion)))
            .andExpect(status().isBadRequest());

        // Validate the TestQuestion in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkQuestionTextIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        testQuestion.setQuestionText(null);

        // Create the TestQuestion, which fails.

        restTestQuestionMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testQuestion)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkQuestionTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        testQuestion.setQuestionType(null);

        // Create the TestQuestion, which fails.

        restTestQuestionMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testQuestion)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIsRequiredIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        testQuestion.setIsRequired(null);

        // Create the TestQuestion, which fails.

        restTestQuestionMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testQuestion)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLanguageIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        testQuestion.setLanguage(null);

        // Create the TestQuestion, which fails.

        restTestQuestionMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testQuestion)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTestQuestions() throws Exception {
        // Initialize the database
        insertedTestQuestion = testQuestionRepository.saveAndFlush(testQuestion);

        // Get all the testQuestionList
        restTestQuestionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(testQuestion.getId().intValue())))
            .andExpect(jsonPath("$.[*].questionText").value(hasItem(DEFAULT_QUESTION_TEXT)))
            .andExpect(jsonPath("$.[*].questionType").value(hasItem(DEFAULT_QUESTION_TYPE.toString())))
            .andExpect(jsonPath("$.[*].stepNumber").value(hasItem(DEFAULT_STEP_NUMBER)))
            .andExpect(jsonPath("$.[*].isRequired").value(hasItem(DEFAULT_IS_REQUIRED)))
            .andExpect(jsonPath("$.[*].category").value(hasItem(DEFAULT_CATEGORY)))
            .andExpect(jsonPath("$.[*].language").value(hasItem(DEFAULT_LANGUAGE)));
    }

    @Test
    @Transactional
    void getTestQuestion() throws Exception {
        // Initialize the database
        insertedTestQuestion = testQuestionRepository.saveAndFlush(testQuestion);

        // Get the testQuestion
        restTestQuestionMockMvc
            .perform(get(ENTITY_API_URL_ID, testQuestion.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(testQuestion.getId().intValue()))
            .andExpect(jsonPath("$.questionText").value(DEFAULT_QUESTION_TEXT))
            .andExpect(jsonPath("$.questionType").value(DEFAULT_QUESTION_TYPE.toString()))
            .andExpect(jsonPath("$.stepNumber").value(DEFAULT_STEP_NUMBER))
            .andExpect(jsonPath("$.isRequired").value(DEFAULT_IS_REQUIRED))
            .andExpect(jsonPath("$.category").value(DEFAULT_CATEGORY))
            .andExpect(jsonPath("$.language").value(DEFAULT_LANGUAGE));
    }

    @Test
    @Transactional
    void getNonExistingTestQuestion() throws Exception {
        // Get the testQuestion
        restTestQuestionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTestQuestion() throws Exception {
        // Initialize the database
        insertedTestQuestion = testQuestionRepository.saveAndFlush(testQuestion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the testQuestion
        TestQuestion updatedTestQuestion = testQuestionRepository.findById(testQuestion.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTestQuestion are not directly saved in db
        em.detach(updatedTestQuestion);
        updatedTestQuestion
            .questionText(UPDATED_QUESTION_TEXT)
            .questionType(UPDATED_QUESTION_TYPE)
            .stepNumber(UPDATED_STEP_NUMBER)
            .isRequired(UPDATED_IS_REQUIRED)
            .category(UPDATED_CATEGORY)
            .language(UPDATED_LANGUAGE);

        restTestQuestionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedTestQuestion.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedTestQuestion))
            )
            .andExpect(status().isOk());

        // Validate the TestQuestion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTestQuestionToMatchAllProperties(updatedTestQuestion);
    }

    @Test
    @Transactional
    void putNonExistingTestQuestion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testQuestion.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTestQuestionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, testQuestion.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(testQuestion))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestQuestion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTestQuestion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testQuestion.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestQuestionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(testQuestion))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestQuestion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTestQuestion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testQuestion.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestQuestionMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testQuestion)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TestQuestion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTestQuestionWithPatch() throws Exception {
        // Initialize the database
        insertedTestQuestion = testQuestionRepository.saveAndFlush(testQuestion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the testQuestion using partial update
        TestQuestion partialUpdatedTestQuestion = new TestQuestion();
        partialUpdatedTestQuestion.setId(testQuestion.getId());

        partialUpdatedTestQuestion.questionText(UPDATED_QUESTION_TEXT).isRequired(UPDATED_IS_REQUIRED).language(UPDATED_LANGUAGE);

        restTestQuestionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTestQuestion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTestQuestion))
            )
            .andExpect(status().isOk());

        // Validate the TestQuestion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTestQuestionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedTestQuestion, testQuestion),
            getPersistedTestQuestion(testQuestion)
        );
    }

    @Test
    @Transactional
    void fullUpdateTestQuestionWithPatch() throws Exception {
        // Initialize the database
        insertedTestQuestion = testQuestionRepository.saveAndFlush(testQuestion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the testQuestion using partial update
        TestQuestion partialUpdatedTestQuestion = new TestQuestion();
        partialUpdatedTestQuestion.setId(testQuestion.getId());

        partialUpdatedTestQuestion
            .questionText(UPDATED_QUESTION_TEXT)
            .questionType(UPDATED_QUESTION_TYPE)
            .stepNumber(UPDATED_STEP_NUMBER)
            .isRequired(UPDATED_IS_REQUIRED)
            .category(UPDATED_CATEGORY)
            .language(UPDATED_LANGUAGE);

        restTestQuestionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTestQuestion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTestQuestion))
            )
            .andExpect(status().isOk());

        // Validate the TestQuestion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTestQuestionUpdatableFieldsEquals(partialUpdatedTestQuestion, getPersistedTestQuestion(partialUpdatedTestQuestion));
    }

    @Test
    @Transactional
    void patchNonExistingTestQuestion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testQuestion.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTestQuestionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, testQuestion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(testQuestion))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestQuestion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTestQuestion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testQuestion.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestQuestionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(testQuestion))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestQuestion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTestQuestion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testQuestion.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestQuestionMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(testQuestion))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the TestQuestion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTestQuestion() throws Exception {
        // Initialize the database
        insertedTestQuestion = testQuestionRepository.saveAndFlush(testQuestion);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the testQuestion
        restTestQuestionMockMvc
            .perform(delete(ENTITY_API_URL_ID, testQuestion.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return testQuestionRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected TestQuestion getPersistedTestQuestion(TestQuestion testQuestion) {
        return testQuestionRepository.findById(testQuestion.getId()).orElseThrow();
    }

    protected void assertPersistedTestQuestionToMatchAllProperties(TestQuestion expectedTestQuestion) {
        assertTestQuestionAllPropertiesEquals(expectedTestQuestion, getPersistedTestQuestion(expectedTestQuestion));
    }

    protected void assertPersistedTestQuestionToMatchUpdatableProperties(TestQuestion expectedTestQuestion) {
        assertTestQuestionAllUpdatablePropertiesEquals(expectedTestQuestion, getPersistedTestQuestion(expectedTestQuestion));
    }
}
