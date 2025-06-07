package com.meet.singles.web.rest;

import static com.meet.singles.domain.UserEventAsserts.*;
import static com.meet.singles.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meet.singles.IntegrationTest;
import com.meet.singles.domain.UserEvent;
import com.meet.singles.domain.enumeration.PaymentStatus;
import com.meet.singles.repository.UserEventRepository;
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
 * Integration tests for the {@link UserEventResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class UserEventResourceIT {

    private static final String DEFAULT_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_STATUS = "BBBBBBBBBB";

    private static final Boolean DEFAULT_CHECKED_IN = false;
    private static final Boolean UPDATED_CHECKED_IN = true;

    private static final Boolean DEFAULT_MATCH_COMPLETED = false;
    private static final Boolean UPDATED_MATCH_COMPLETED = true;

    private static final PaymentStatus DEFAULT_PAYMENT_STATUS = PaymentStatus.PAID;
    private static final PaymentStatus UPDATED_PAYMENT_STATUS = PaymentStatus.UNPAID;

    private static final String ENTITY_API_URL = "/api/user-events";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private UserEventRepository userEventRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restUserEventMockMvc;

    private UserEvent userEvent;

    private UserEvent insertedUserEvent;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserEvent createEntity() {
        return new UserEvent()
            .status(DEFAULT_STATUS)
            .checkedIn(DEFAULT_CHECKED_IN)
            .matchCompleted(DEFAULT_MATCH_COMPLETED)
            .paymentStatus(DEFAULT_PAYMENT_STATUS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserEvent createUpdatedEntity() {
        return new UserEvent()
            .status(UPDATED_STATUS)
            .checkedIn(UPDATED_CHECKED_IN)
            .matchCompleted(UPDATED_MATCH_COMPLETED)
            .paymentStatus(UPDATED_PAYMENT_STATUS);
    }

    @BeforeEach
    void initTest() {
        userEvent = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedUserEvent != null) {
            userEventRepository.delete(insertedUserEvent);
            insertedUserEvent = null;
        }
    }

    @Test
    @Transactional
    void createUserEvent() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the UserEvent
        var returnedUserEvent = om.readValue(
            restUserEventMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userEvent)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            UserEvent.class
        );

        // Validate the UserEvent in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertUserEventUpdatableFieldsEquals(returnedUserEvent, getPersistedUserEvent(returnedUserEvent));

        insertedUserEvent = returnedUserEvent;
    }

    @Test
    @Transactional
    void createUserEventWithExistingId() throws Exception {
        // Create the UserEvent with an existing ID
        userEvent.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restUserEventMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userEvent)))
            .andExpect(status().isBadRequest());

        // Validate the UserEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkPaymentStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        userEvent.setPaymentStatus(null);

        // Create the UserEvent, which fails.

        restUserEventMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userEvent)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllUserEvents() throws Exception {
        // Initialize the database
        insertedUserEvent = userEventRepository.saveAndFlush(userEvent);

        // Get all the userEventList
        restUserEventMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(userEvent.getId().intValue())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS)))
            .andExpect(jsonPath("$.[*].checkedIn").value(hasItem(DEFAULT_CHECKED_IN)))
            .andExpect(jsonPath("$.[*].matchCompleted").value(hasItem(DEFAULT_MATCH_COMPLETED)))
            .andExpect(jsonPath("$.[*].paymentStatus").value(hasItem(DEFAULT_PAYMENT_STATUS.toString())));
    }

    @Test
    @Transactional
    void getUserEvent() throws Exception {
        // Initialize the database
        insertedUserEvent = userEventRepository.saveAndFlush(userEvent);

        // Get the userEvent
        restUserEventMockMvc
            .perform(get(ENTITY_API_URL_ID, userEvent.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(userEvent.getId().intValue()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS))
            .andExpect(jsonPath("$.checkedIn").value(DEFAULT_CHECKED_IN))
            .andExpect(jsonPath("$.matchCompleted").value(DEFAULT_MATCH_COMPLETED))
            .andExpect(jsonPath("$.paymentStatus").value(DEFAULT_PAYMENT_STATUS.toString()));
    }

    @Test
    @Transactional
    void getNonExistingUserEvent() throws Exception {
        // Get the userEvent
        restUserEventMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingUserEvent() throws Exception {
        // Initialize the database
        insertedUserEvent = userEventRepository.saveAndFlush(userEvent);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userEvent
        UserEvent updatedUserEvent = userEventRepository.findById(userEvent.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedUserEvent are not directly saved in db
        em.detach(updatedUserEvent);
        updatedUserEvent
            .status(UPDATED_STATUS)
            .checkedIn(UPDATED_CHECKED_IN)
            .matchCompleted(UPDATED_MATCH_COMPLETED)
            .paymentStatus(UPDATED_PAYMENT_STATUS);

        restUserEventMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedUserEvent.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedUserEvent))
            )
            .andExpect(status().isOk());

        // Validate the UserEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedUserEventToMatchAllProperties(updatedUserEvent);
    }

    @Test
    @Transactional
    void putNonExistingUserEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userEvent.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserEventMockMvc
            .perform(
                put(ENTITY_API_URL_ID, userEvent.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(userEvent))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchUserEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userEvent.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserEventMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(userEvent))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamUserEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userEvent.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserEventMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(userEvent)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateUserEventWithPatch() throws Exception {
        // Initialize the database
        insertedUserEvent = userEventRepository.saveAndFlush(userEvent);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userEvent using partial update
        UserEvent partialUpdatedUserEvent = new UserEvent();
        partialUpdatedUserEvent.setId(userEvent.getId());

        partialUpdatedUserEvent.checkedIn(UPDATED_CHECKED_IN);

        restUserEventMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserEvent.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUserEvent))
            )
            .andExpect(status().isOk());

        // Validate the UserEvent in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUserEventUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedUserEvent, userEvent),
            getPersistedUserEvent(userEvent)
        );
    }

    @Test
    @Transactional
    void fullUpdateUserEventWithPatch() throws Exception {
        // Initialize the database
        insertedUserEvent = userEventRepository.saveAndFlush(userEvent);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userEvent using partial update
        UserEvent partialUpdatedUserEvent = new UserEvent();
        partialUpdatedUserEvent.setId(userEvent.getId());

        partialUpdatedUserEvent
            .status(UPDATED_STATUS)
            .checkedIn(UPDATED_CHECKED_IN)
            .matchCompleted(UPDATED_MATCH_COMPLETED)
            .paymentStatus(UPDATED_PAYMENT_STATUS);

        restUserEventMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserEvent.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUserEvent))
            )
            .andExpect(status().isOk());

        // Validate the UserEvent in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUserEventUpdatableFieldsEquals(partialUpdatedUserEvent, getPersistedUserEvent(partialUpdatedUserEvent));
    }

    @Test
    @Transactional
    void patchNonExistingUserEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userEvent.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserEventMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, userEvent.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(userEvent))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchUserEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userEvent.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserEventMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(userEvent))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamUserEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userEvent.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserEventMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(userEvent))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteUserEvent() throws Exception {
        // Initialize the database
        insertedUserEvent = userEventRepository.saveAndFlush(userEvent);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the userEvent
        restUserEventMockMvc
            .perform(delete(ENTITY_API_URL_ID, userEvent.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return userEventRepository.count();
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

    protected UserEvent getPersistedUserEvent(UserEvent userEvent) {
        return userEventRepository.findById(userEvent.getId()).orElseThrow();
    }

    protected void assertPersistedUserEventToMatchAllProperties(UserEvent expectedUserEvent) {
        assertUserEventAllPropertiesEquals(expectedUserEvent, getPersistedUserEvent(expectedUserEvent));
    }

    protected void assertPersistedUserEventToMatchUpdatableProperties(UserEvent expectedUserEvent) {
        assertUserEventAllUpdatablePropertiesEquals(expectedUserEvent, getPersistedUserEvent(expectedUserEvent));
    }
}
