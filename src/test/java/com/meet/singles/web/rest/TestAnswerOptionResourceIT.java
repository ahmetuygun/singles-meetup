package com.meet.singles.web.rest;

import static com.meet.singles.domain.TestAnswerOptionAsserts.*;
import static com.meet.singles.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meet.singles.IntegrationTest;
import com.meet.singles.domain.TestAnswerOption;
import com.meet.singles.repository.TestAnswerOptionRepository;
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
 * Integration tests for the {@link TestAnswerOptionResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TestAnswerOptionResourceIT {

    private static final String DEFAULT_OPTION_TEXT = "AAAAAAAAAA";
    private static final String UPDATED_OPTION_TEXT = "BBBBBBBBBB";

    private static final Integer DEFAULT_VALUE = 1;
    private static final Integer UPDATED_VALUE = 2;

    private static final String ENTITY_API_URL = "/api/test-answer-options";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TestAnswerOptionRepository testAnswerOptionRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTestAnswerOptionMockMvc;

    private TestAnswerOption testAnswerOption;

    private TestAnswerOption insertedTestAnswerOption;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TestAnswerOption createEntity() {
        return new TestAnswerOption().optionText(DEFAULT_OPTION_TEXT).value(DEFAULT_VALUE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TestAnswerOption createUpdatedEntity() {
        return new TestAnswerOption().optionText(UPDATED_OPTION_TEXT).value(UPDATED_VALUE);
    }

    @BeforeEach
    void initTest() {
        testAnswerOption = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedTestAnswerOption != null) {
            testAnswerOptionRepository.delete(insertedTestAnswerOption);
            insertedTestAnswerOption = null;
        }
    }

    @Test
    @Transactional
    void createTestAnswerOption() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the TestAnswerOption
        var returnedTestAnswerOption = om.readValue(
            restTestAnswerOptionMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(testAnswerOption))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TestAnswerOption.class
        );

        // Validate the TestAnswerOption in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertTestAnswerOptionUpdatableFieldsEquals(returnedTestAnswerOption, getPersistedTestAnswerOption(returnedTestAnswerOption));

        insertedTestAnswerOption = returnedTestAnswerOption;
    }

    @Test
    @Transactional
    void createTestAnswerOptionWithExistingId() throws Exception {
        // Create the TestAnswerOption with an existing ID
        testAnswerOption.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTestAnswerOptionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testAnswerOption))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestAnswerOption in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkOptionTextIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        testAnswerOption.setOptionText(null);

        // Create the TestAnswerOption, which fails.

        restTestAnswerOptionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testAnswerOption))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTestAnswerOptions() throws Exception {
        // Initialize the database
        insertedTestAnswerOption = testAnswerOptionRepository.saveAndFlush(testAnswerOption);

        // Get all the testAnswerOptionList
        restTestAnswerOptionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(testAnswerOption.getId().intValue())))
            .andExpect(jsonPath("$.[*].optionText").value(hasItem(DEFAULT_OPTION_TEXT)))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE)));
    }

    @Test
    @Transactional
    void getTestAnswerOption() throws Exception {
        // Initialize the database
        insertedTestAnswerOption = testAnswerOptionRepository.saveAndFlush(testAnswerOption);

        // Get the testAnswerOption
        restTestAnswerOptionMockMvc
            .perform(get(ENTITY_API_URL_ID, testAnswerOption.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(testAnswerOption.getId().intValue()))
            .andExpect(jsonPath("$.optionText").value(DEFAULT_OPTION_TEXT))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE));
    }

    @Test
    @Transactional
    void getNonExistingTestAnswerOption() throws Exception {
        // Get the testAnswerOption
        restTestAnswerOptionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTestAnswerOption() throws Exception {
        // Initialize the database
        insertedTestAnswerOption = testAnswerOptionRepository.saveAndFlush(testAnswerOption);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the testAnswerOption
        TestAnswerOption updatedTestAnswerOption = testAnswerOptionRepository.findById(testAnswerOption.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTestAnswerOption are not directly saved in db
        em.detach(updatedTestAnswerOption);
        updatedTestAnswerOption.optionText(UPDATED_OPTION_TEXT).value(UPDATED_VALUE);

        restTestAnswerOptionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedTestAnswerOption.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedTestAnswerOption))
            )
            .andExpect(status().isOk());

        // Validate the TestAnswerOption in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTestAnswerOptionToMatchAllProperties(updatedTestAnswerOption);
    }

    @Test
    @Transactional
    void putNonExistingTestAnswerOption() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testAnswerOption.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTestAnswerOptionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, testAnswerOption.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(testAnswerOption))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestAnswerOption in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTestAnswerOption() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testAnswerOption.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestAnswerOptionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(testAnswerOption))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestAnswerOption in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTestAnswerOption() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testAnswerOption.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestAnswerOptionMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(testAnswerOption))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the TestAnswerOption in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTestAnswerOptionWithPatch() throws Exception {
        // Initialize the database
        insertedTestAnswerOption = testAnswerOptionRepository.saveAndFlush(testAnswerOption);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the testAnswerOption using partial update
        TestAnswerOption partialUpdatedTestAnswerOption = new TestAnswerOption();
        partialUpdatedTestAnswerOption.setId(testAnswerOption.getId());

        partialUpdatedTestAnswerOption.value(UPDATED_VALUE);

        restTestAnswerOptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTestAnswerOption.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTestAnswerOption))
            )
            .andExpect(status().isOk());

        // Validate the TestAnswerOption in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTestAnswerOptionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedTestAnswerOption, testAnswerOption),
            getPersistedTestAnswerOption(testAnswerOption)
        );
    }

    @Test
    @Transactional
    void fullUpdateTestAnswerOptionWithPatch() throws Exception {
        // Initialize the database
        insertedTestAnswerOption = testAnswerOptionRepository.saveAndFlush(testAnswerOption);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the testAnswerOption using partial update
        TestAnswerOption partialUpdatedTestAnswerOption = new TestAnswerOption();
        partialUpdatedTestAnswerOption.setId(testAnswerOption.getId());

        partialUpdatedTestAnswerOption.optionText(UPDATED_OPTION_TEXT).value(UPDATED_VALUE);

        restTestAnswerOptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTestAnswerOption.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTestAnswerOption))
            )
            .andExpect(status().isOk());

        // Validate the TestAnswerOption in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTestAnswerOptionUpdatableFieldsEquals(
            partialUpdatedTestAnswerOption,
            getPersistedTestAnswerOption(partialUpdatedTestAnswerOption)
        );
    }

    @Test
    @Transactional
    void patchNonExistingTestAnswerOption() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testAnswerOption.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTestAnswerOptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, testAnswerOption.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(testAnswerOption))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestAnswerOption in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTestAnswerOption() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testAnswerOption.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestAnswerOptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(testAnswerOption))
            )
            .andExpect(status().isBadRequest());

        // Validate the TestAnswerOption in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTestAnswerOption() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        testAnswerOption.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTestAnswerOptionMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(testAnswerOption))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the TestAnswerOption in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTestAnswerOption() throws Exception {
        // Initialize the database
        insertedTestAnswerOption = testAnswerOptionRepository.saveAndFlush(testAnswerOption);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the testAnswerOption
        restTestAnswerOptionMockMvc
            .perform(delete(ENTITY_API_URL_ID, testAnswerOption.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return testAnswerOptionRepository.count();
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

    protected TestAnswerOption getPersistedTestAnswerOption(TestAnswerOption testAnswerOption) {
        return testAnswerOptionRepository.findById(testAnswerOption.getId()).orElseThrow();
    }

    protected void assertPersistedTestAnswerOptionToMatchAllProperties(TestAnswerOption expectedTestAnswerOption) {
        assertTestAnswerOptionAllPropertiesEquals(expectedTestAnswerOption, getPersistedTestAnswerOption(expectedTestAnswerOption));
    }

    protected void assertPersistedTestAnswerOptionToMatchUpdatableProperties(TestAnswerOption expectedTestAnswerOption) {
        assertTestAnswerOptionAllUpdatablePropertiesEquals(
            expectedTestAnswerOption,
            getPersistedTestAnswerOption(expectedTestAnswerOption)
        );
    }
}
