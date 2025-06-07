package com.meet.singles.web.rest;

import static com.meet.singles.domain.VenueAsserts.*;
import static com.meet.singles.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meet.singles.IntegrationTest;
import com.meet.singles.domain.Venue;
import com.meet.singles.repository.VenueRepository;
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
 * Integration tests for the {@link VenueResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class VenueResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_ADDRESS = "AAAAAAAAAA";
    private static final String UPDATED_ADDRESS = "BBBBBBBBBB";

    private static final String DEFAULT_CITY = "AAAAAAAAAA";
    private static final String UPDATED_CITY = "BBBBBBBBBB";

    private static final Integer DEFAULT_CAPACITY = 1;
    private static final Integer UPDATED_CAPACITY = 2;

    private static final String DEFAULT_CONTACT_INFO = "AAAAAAAAAA";
    private static final String UPDATED_CONTACT_INFO = "BBBBBBBBBB";

    private static final String DEFAULT_PHOTO_URL = "AAAAAAAAAA";
    private static final String UPDATED_PHOTO_URL = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/venues";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restVenueMockMvc;

    private Venue venue;

    private Venue insertedVenue;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Venue createEntity() {
        return new Venue()
            .name(DEFAULT_NAME)
            .address(DEFAULT_ADDRESS)
            .city(DEFAULT_CITY)
            .capacity(DEFAULT_CAPACITY)
            .contactInfo(DEFAULT_CONTACT_INFO)
            .photoUrl(DEFAULT_PHOTO_URL);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Venue createUpdatedEntity() {
        return new Venue()
            .name(UPDATED_NAME)
            .address(UPDATED_ADDRESS)
            .city(UPDATED_CITY)
            .capacity(UPDATED_CAPACITY)
            .contactInfo(UPDATED_CONTACT_INFO)
            .photoUrl(UPDATED_PHOTO_URL);
    }

    @BeforeEach
    void initTest() {
        venue = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedVenue != null) {
            venueRepository.delete(insertedVenue);
            insertedVenue = null;
        }
    }

    @Test
    @Transactional
    void createVenue() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Venue
        var returnedVenue = om.readValue(
            restVenueMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(venue)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            Venue.class
        );

        // Validate the Venue in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertVenueUpdatableFieldsEquals(returnedVenue, getPersistedVenue(returnedVenue));

        insertedVenue = returnedVenue;
    }

    @Test
    @Transactional
    void createVenueWithExistingId() throws Exception {
        // Create the Venue with an existing ID
        venue.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restVenueMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(venue)))
            .andExpect(status().isBadRequest());

        // Validate the Venue in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        venue.setName(null);

        // Create the Venue, which fails.

        restVenueMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(venue)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAddressIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        venue.setAddress(null);

        // Create the Venue, which fails.

        restVenueMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(venue)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllVenues() throws Exception {
        // Initialize the database
        insertedVenue = venueRepository.saveAndFlush(venue);

        // Get all the venueList
        restVenueMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(venue.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].address").value(hasItem(DEFAULT_ADDRESS)))
            .andExpect(jsonPath("$.[*].city").value(hasItem(DEFAULT_CITY)))
            .andExpect(jsonPath("$.[*].capacity").value(hasItem(DEFAULT_CAPACITY)))
            .andExpect(jsonPath("$.[*].contactInfo").value(hasItem(DEFAULT_CONTACT_INFO)))
            .andExpect(jsonPath("$.[*].photoUrl").value(hasItem(DEFAULT_PHOTO_URL)));
    }

    @Test
    @Transactional
    void getVenue() throws Exception {
        // Initialize the database
        insertedVenue = venueRepository.saveAndFlush(venue);

        // Get the venue
        restVenueMockMvc
            .perform(get(ENTITY_API_URL_ID, venue.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(venue.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.address").value(DEFAULT_ADDRESS))
            .andExpect(jsonPath("$.city").value(DEFAULT_CITY))
            .andExpect(jsonPath("$.capacity").value(DEFAULT_CAPACITY))
            .andExpect(jsonPath("$.contactInfo").value(DEFAULT_CONTACT_INFO))
            .andExpect(jsonPath("$.photoUrl").value(DEFAULT_PHOTO_URL));
    }

    @Test
    @Transactional
    void getNonExistingVenue() throws Exception {
        // Get the venue
        restVenueMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingVenue() throws Exception {
        // Initialize the database
        insertedVenue = venueRepository.saveAndFlush(venue);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the venue
        Venue updatedVenue = venueRepository.findById(venue.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedVenue are not directly saved in db
        em.detach(updatedVenue);
        updatedVenue
            .name(UPDATED_NAME)
            .address(UPDATED_ADDRESS)
            .city(UPDATED_CITY)
            .capacity(UPDATED_CAPACITY)
            .contactInfo(UPDATED_CONTACT_INFO)
            .photoUrl(UPDATED_PHOTO_URL);

        restVenueMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedVenue.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedVenue))
            )
            .andExpect(status().isOk());

        // Validate the Venue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedVenueToMatchAllProperties(updatedVenue);
    }

    @Test
    @Transactional
    void putNonExistingVenue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venue.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restVenueMockMvc
            .perform(
                put(ENTITY_API_URL_ID, venue.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(venue))
            )
            .andExpect(status().isBadRequest());

        // Validate the Venue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchVenue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venue.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVenueMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(venue))
            )
            .andExpect(status().isBadRequest());

        // Validate the Venue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamVenue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venue.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVenueMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(venue)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Venue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateVenueWithPatch() throws Exception {
        // Initialize the database
        insertedVenue = venueRepository.saveAndFlush(venue);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the venue using partial update
        Venue partialUpdatedVenue = new Venue();
        partialUpdatedVenue.setId(venue.getId());

        partialUpdatedVenue.city(UPDATED_CITY).capacity(UPDATED_CAPACITY).contactInfo(UPDATED_CONTACT_INFO);

        restVenueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedVenue.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedVenue))
            )
            .andExpect(status().isOk());

        // Validate the Venue in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertVenueUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedVenue, venue), getPersistedVenue(venue));
    }

    @Test
    @Transactional
    void fullUpdateVenueWithPatch() throws Exception {
        // Initialize the database
        insertedVenue = venueRepository.saveAndFlush(venue);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the venue using partial update
        Venue partialUpdatedVenue = new Venue();
        partialUpdatedVenue.setId(venue.getId());

        partialUpdatedVenue
            .name(UPDATED_NAME)
            .address(UPDATED_ADDRESS)
            .city(UPDATED_CITY)
            .capacity(UPDATED_CAPACITY)
            .contactInfo(UPDATED_CONTACT_INFO)
            .photoUrl(UPDATED_PHOTO_URL);

        restVenueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedVenue.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedVenue))
            )
            .andExpect(status().isOk());

        // Validate the Venue in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertVenueUpdatableFieldsEquals(partialUpdatedVenue, getPersistedVenue(partialUpdatedVenue));
    }

    @Test
    @Transactional
    void patchNonExistingVenue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venue.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restVenueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, venue.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(venue))
            )
            .andExpect(status().isBadRequest());

        // Validate the Venue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchVenue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venue.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVenueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(venue))
            )
            .andExpect(status().isBadRequest());

        // Validate the Venue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamVenue() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        venue.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVenueMockMvc
            .perform(patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(venue)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Venue in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteVenue() throws Exception {
        // Initialize the database
        insertedVenue = venueRepository.saveAndFlush(venue);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the venue
        restVenueMockMvc
            .perform(delete(ENTITY_API_URL_ID, venue.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return venueRepository.count();
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

    protected Venue getPersistedVenue(Venue venue) {
        return venueRepository.findById(venue.getId()).orElseThrow();
    }

    protected void assertPersistedVenueToMatchAllProperties(Venue expectedVenue) {
        assertVenueAllPropertiesEquals(expectedVenue, getPersistedVenue(expectedVenue));
    }

    protected void assertPersistedVenueToMatchUpdatableProperties(Venue expectedVenue) {
        assertVenueAllUpdatablePropertiesEquals(expectedVenue, getPersistedVenue(expectedVenue));
    }
}
