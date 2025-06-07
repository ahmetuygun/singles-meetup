package com.meet.singles.web.rest;

import static com.meet.singles.domain.UserTestAnswerAsserts.*;
import static com.meet.singles.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meet.singles.IntegrationTest;
import com.meet.singles.domain.UserTestAnswer;
import com.meet.singles.repository.UserTestAnswerRepository;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
 * Integration tests for the {@link UserTestAnswerResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class UserTestAnswerResourceIT {

    private static final Integer DEFAULT_ANSWER_VALUE = 1;
    private static final Integer UPDATED_ANSWER_VALUE = 2;

    private static final Instant DEFAULT_TIMESTAMP = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_TIMESTAMP = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/user-test-answers";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private UserTestAnswerRepository userTestAnswerRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restUserTestAnswerMockMvc;

    private UserTestAnswer userTestAnswer;

    private UserTestAnswer insertedUserTestAnswer;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserTestAnswer createEntity() {
        return new UserTestAnswer().answerValue(DEFAULT_ANSWER_VALUE).timestamp(DEFAULT_TIMESTAMP);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserTestAnswer createUpdatedEntity() {
        return new UserTestAnswer().answerValue(UPDATED_ANSWER_VALUE).timestamp(UPDATED_TIMESTAMP);
    }

    @BeforeEach
    void initTest() {
        userTestAnswer = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedUserTestAnswer != null) {
            userTestAnswerRepository.delete(insertedUserTestAnswer);
            insertedUserTestAnswer = null;
        }
    }

    @Test
    @Transactional
    void createUserTestAnswer() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the UserTestAnswer
        var returnedUserTestAnswer = om.readValue(
            restUserTestAnswerMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userTestAnswer))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            UserTestAnswer.class
        );

        // Validate the UserTestAnswer in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertUserTestAnswerUpdatableFieldsEquals(returnedUserTestAnswer, getPersistedUserTestAnswer(returnedUserTestAnswer));

        insertedUserTestAnswer = returnedUserTestAnswer;
    }

    @Test
    @Transactional
    void createUserTestAnswerWithExistingId() throws Exception {
        // Create the UserTestAnswer with an existing ID
        userTestAnswer.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restUserTestAnswerMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userTestAnswer))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserTestAnswer in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkAnswerValueIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        userTestAnswer.setAnswerValue(null);

        // Create the UserTestAnswer, which fails.

        restUserTestAnswerMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userTestAnswer))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllUserTestAnswers() throws Exception {
        // Initialize the database
        insertedUserTestAnswer = userTestAnswerRepository.saveAndFlush(userTestAnswer);

        // Get all the userTestAnswerList
        restUserTestAnswerMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(userTestAnswer.getId().intValue())))
            .andExpect(jsonPath("$.[*].answerValue").value(hasItem(DEFAULT_ANSWER_VALUE)))
            .andExpect(jsonPath("$.[*].timestamp").value(hasItem(DEFAULT_TIMESTAMP.toString())));
    }

    @Test
    @Transactional
    void getUserTestAnswer() throws Exception {
        // Initialize the database
        insertedUserTestAnswer = userTestAnswerRepository.saveAndFlush(userTestAnswer);

        // Get the userTestAnswer
        restUserTestAnswerMockMvc
            .perform(get(ENTITY_API_URL_ID, userTestAnswer.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(userTestAnswer.getId().intValue()))
            .andExpect(jsonPath("$.answerValue").value(DEFAULT_ANSWER_VALUE))
            .andExpect(jsonPath("$.timestamp").value(DEFAULT_TIMESTAMP.toString()));
    }

    @Test
    @Transactional
    void getNonExistingUserTestAnswer() throws Exception {
        // Get the userTestAnswer
        restUserTestAnswerMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingUserTestAnswer() throws Exception {
        // Initialize the database
        insertedUserTestAnswer = userTestAnswerRepository.saveAndFlush(userTestAnswer);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userTestAnswer
        UserTestAnswer updatedUserTestAnswer = userTestAnswerRepository.findById(userTestAnswer.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedUserTestAnswer are not directly saved in db
        em.detach(updatedUserTestAnswer);
        updatedUserTestAnswer.answerValue(UPDATED_ANSWER_VALUE).timestamp(UPDATED_TIMESTAMP);

        restUserTestAnswerMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedUserTestAnswer.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedUserTestAnswer))
            )
            .andExpect(status().isOk());

        // Validate the UserTestAnswer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedUserTestAnswerToMatchAllProperties(updatedUserTestAnswer);
    }

    @Test
    @Transactional
    void putNonExistingUserTestAnswer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userTestAnswer.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserTestAnswerMockMvc
            .perform(
                put(ENTITY_API_URL_ID, userTestAnswer.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(userTestAnswer))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserTestAnswer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchUserTestAnswer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userTestAnswer.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserTestAnswerMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(userTestAnswer))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserTestAnswer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamUserTestAnswer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userTestAnswer.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserTestAnswerMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userTestAnswer)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserTestAnswer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateUserTestAnswerWithPatch() throws Exception {
        // Initialize the database
        insertedUserTestAnswer = userTestAnswerRepository.saveAndFlush(userTestAnswer);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userTestAnswer using partial update
        UserTestAnswer partialUpdatedUserTestAnswer = new UserTestAnswer();
        partialUpdatedUserTestAnswer.setId(userTestAnswer.getId());

        partialUpdatedUserTestAnswer.answerValue(UPDATED_ANSWER_VALUE);

        restUserTestAnswerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserTestAnswer.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUserTestAnswer))
            )
            .andExpect(status().isOk());

        // Validate the UserTestAnswer in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUserTestAnswerUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedUserTestAnswer, userTestAnswer),
            getPersistedUserTestAnswer(userTestAnswer)
        );
    }

    @Test
    @Transactional
    void fullUpdateUserTestAnswerWithPatch() throws Exception {
        // Initialize the database
        insertedUserTestAnswer = userTestAnswerRepository.saveAndFlush(userTestAnswer);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userTestAnswer using partial update
        UserTestAnswer partialUpdatedUserTestAnswer = new UserTestAnswer();
        partialUpdatedUserTestAnswer.setId(userTestAnswer.getId());

        partialUpdatedUserTestAnswer.answerValue(UPDATED_ANSWER_VALUE).timestamp(UPDATED_TIMESTAMP);

        restUserTestAnswerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserTestAnswer.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUserTestAnswer))
            )
            .andExpect(status().isOk());

        // Validate the UserTestAnswer in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUserTestAnswerUpdatableFieldsEquals(partialUpdatedUserTestAnswer, getPersistedUserTestAnswer(partialUpdatedUserTestAnswer));
    }

    @Test
    @Transactional
    void patchNonExistingUserTestAnswer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userTestAnswer.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserTestAnswerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, userTestAnswer.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(userTestAnswer))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserTestAnswer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchUserTestAnswer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userTestAnswer.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserTestAnswerMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(userTestAnswer))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserTestAnswer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamUserTestAnswer() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userTestAnswer.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserTestAnswerMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(userTestAnswer))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserTestAnswer in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteUserTestAnswer() throws Exception {
        // Initialize the database
        insertedUserTestAnswer = userTestAnswerRepository.saveAndFlush(userTestAnswer);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the userTestAnswer
        restUserTestAnswerMockMvc
            .perform(delete(ENTITY_API_URL_ID, userTestAnswer.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return userTestAnswerRepository.count();
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

    protected UserTestAnswer getPersistedUserTestAnswer(UserTestAnswer userTestAnswer) {
        return userTestAnswerRepository.findById(userTestAnswer.getId()).orElseThrow();
    }

    protected void assertPersistedUserTestAnswerToMatchAllProperties(UserTestAnswer expectedUserTestAnswer) {
        assertUserTestAnswerAllPropertiesEquals(expectedUserTestAnswer, getPersistedUserTestAnswer(expectedUserTestAnswer));
    }

    protected void assertPersistedUserTestAnswerToMatchUpdatableProperties(UserTestAnswer expectedUserTestAnswer) {
        assertUserTestAnswerAllUpdatablePropertiesEquals(expectedUserTestAnswer, getPersistedUserTestAnswer(expectedUserTestAnswer));
    }
}
