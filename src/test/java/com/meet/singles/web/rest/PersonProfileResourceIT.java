package com.meet.singles.web.rest;

import static com.meet.singles.domain.PersonProfileAsserts.*;
import static com.meet.singles.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meet.singles.IntegrationTest;
import com.meet.singles.domain.PersonProfile;
import com.meet.singles.repository.PersonProfileRepository;
import com.meet.singles.repository.UserRepository;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link PersonProfileResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class PersonProfileResourceIT {

    private static final String DEFAULT_FIRST_NAME = "AAAAAAAAAA";
    private static final String UPDATED_FIRST_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_LAST_NAME = "AAAAAAAAAA";
    private static final String UPDATED_LAST_NAME = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_DOB = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DOB = LocalDate.now(ZoneId.systemDefault());

    private static final String DEFAULT_GENDER = "AAAAAAAAAA";
    private static final String UPDATED_GENDER = "BBBBBBBBBB";

    private static final String DEFAULT_BIO = "AAAAAAAAAA";
    private static final String UPDATED_BIO = "BBBBBBBBBB";

    private static final String DEFAULT_INTERESTS = "AAAAAAAAAA";
    private static final String UPDATED_INTERESTS = "BBBBBBBBBB";

    private static final String DEFAULT_LOCATION = "AAAAAAAAAA";
    private static final String UPDATED_LOCATION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/person-profiles";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PersonProfileRepository personProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private PersonProfileRepository personProfileRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPersonProfileMockMvc;

    private PersonProfile personProfile;

    private PersonProfile insertedPersonProfile;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PersonProfile createEntity() {
        return new PersonProfile()
            .firstName(DEFAULT_FIRST_NAME)
            .lastName(DEFAULT_LAST_NAME)
            .dob(DEFAULT_DOB)
            .gender(DEFAULT_GENDER)
            .bio(DEFAULT_BIO)
            .interests(DEFAULT_INTERESTS)
            .location(DEFAULT_LOCATION);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PersonProfile createUpdatedEntity() {
        return new PersonProfile()
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .dob(UPDATED_DOB)
            .gender(UPDATED_GENDER)
            .bio(UPDATED_BIO)
            .interests(UPDATED_INTERESTS)
            .location(UPDATED_LOCATION);
    }

    @BeforeEach
    void initTest() {
        personProfile = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPersonProfile != null) {
            personProfileRepository.delete(insertedPersonProfile);
            insertedPersonProfile = null;
        }
        userRepository.deleteAll();
    }

    @Test
    @Transactional
    void createPersonProfile() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the PersonProfile
        var returnedPersonProfile = om.readValue(
            restPersonProfileMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personProfile))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PersonProfile.class
        );

        // Validate the PersonProfile in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertPersonProfileUpdatableFieldsEquals(returnedPersonProfile, getPersistedPersonProfile(returnedPersonProfile));

        insertedPersonProfile = returnedPersonProfile;
    }

    @Test
    @Transactional
    void createPersonProfileWithExistingId() throws Exception {
        // Create the PersonProfile with an existing ID
        personProfile.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPersonProfileMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personProfile)))
            .andExpect(status().isBadRequest());

        // Validate the PersonProfile in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkFirstNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        personProfile.setFirstName(null);

        // Create the PersonProfile, which fails.

        restPersonProfileMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personProfile)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLastNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        personProfile.setLastName(null);

        // Create the PersonProfile, which fails.

        restPersonProfileMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personProfile)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDobIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        personProfile.setDob(null);

        // Create the PersonProfile, which fails.

        restPersonProfileMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personProfile)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkGenderIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        personProfile.setGender(null);

        // Create the PersonProfile, which fails.

        restPersonProfileMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personProfile)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPersonProfiles() throws Exception {
        // Initialize the database
        insertedPersonProfile = personProfileRepository.saveAndFlush(personProfile);

        // Get all the personProfileList
        restPersonProfileMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(personProfile.getId().intValue())))
            .andExpect(jsonPath("$.[*].firstName").value(hasItem(DEFAULT_FIRST_NAME)))
            .andExpect(jsonPath("$.[*].lastName").value(hasItem(DEFAULT_LAST_NAME)))
            .andExpect(jsonPath("$.[*].dob").value(hasItem(DEFAULT_DOB.toString())))
            .andExpect(jsonPath("$.[*].gender").value(hasItem(DEFAULT_GENDER)))
            .andExpect(jsonPath("$.[*].bio").value(hasItem(DEFAULT_BIO)))
            .andExpect(jsonPath("$.[*].interests").value(hasItem(DEFAULT_INTERESTS)))
            .andExpect(jsonPath("$.[*].location").value(hasItem(DEFAULT_LOCATION)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllPersonProfilesWithEagerRelationshipsIsEnabled() throws Exception {
        when(personProfileRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restPersonProfileMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(personProfileRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllPersonProfilesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(personProfileRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restPersonProfileMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(personProfileRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getPersonProfile() throws Exception {
        // Initialize the database
        insertedPersonProfile = personProfileRepository.saveAndFlush(personProfile);

        // Get the personProfile
        restPersonProfileMockMvc
            .perform(get(ENTITY_API_URL_ID, personProfile.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(personProfile.getId().intValue()))
            .andExpect(jsonPath("$.firstName").value(DEFAULT_FIRST_NAME))
            .andExpect(jsonPath("$.lastName").value(DEFAULT_LAST_NAME))
            .andExpect(jsonPath("$.dob").value(DEFAULT_DOB.toString()))
            .andExpect(jsonPath("$.gender").value(DEFAULT_GENDER))
            .andExpect(jsonPath("$.bio").value(DEFAULT_BIO))
            .andExpect(jsonPath("$.interests").value(DEFAULT_INTERESTS))
            .andExpect(jsonPath("$.location").value(DEFAULT_LOCATION));
    }

    @Test
    @Transactional
    void getNonExistingPersonProfile() throws Exception {
        // Get the personProfile
        restPersonProfileMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPersonProfile() throws Exception {
        // Initialize the database
        insertedPersonProfile = personProfileRepository.saveAndFlush(personProfile);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the personProfile
        PersonProfile updatedPersonProfile = personProfileRepository.findById(personProfile.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPersonProfile are not directly saved in db
        em.detach(updatedPersonProfile);
        updatedPersonProfile
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .dob(UPDATED_DOB)
            .gender(UPDATED_GENDER)
            .bio(UPDATED_BIO)
            .interests(UPDATED_INTERESTS)
            .location(UPDATED_LOCATION);

        restPersonProfileMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedPersonProfile.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedPersonProfile))
            )
            .andExpect(status().isOk());

        // Validate the PersonProfile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPersonProfileToMatchAllProperties(updatedPersonProfile);
    }

    @Test
    @Transactional
    void putNonExistingPersonProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        personProfile.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPersonProfileMockMvc
            .perform(
                put(ENTITY_API_URL_ID, personProfile.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(personProfile))
            )
            .andExpect(status().isBadRequest());

        // Validate the PersonProfile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPersonProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        personProfile.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPersonProfileMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(personProfile))
            )
            .andExpect(status().isBadRequest());

        // Validate the PersonProfile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPersonProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        personProfile.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPersonProfileMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personProfile)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PersonProfile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePersonProfileWithPatch() throws Exception {
        // Initialize the database
        insertedPersonProfile = personProfileRepository.saveAndFlush(personProfile);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the personProfile using partial update
        PersonProfile partialUpdatedPersonProfile = new PersonProfile();
        partialUpdatedPersonProfile.setId(personProfile.getId());

        partialUpdatedPersonProfile.lastName(UPDATED_LAST_NAME).dob(UPDATED_DOB).gender(UPDATED_GENDER).bio(UPDATED_BIO);

        restPersonProfileMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPersonProfile.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPersonProfile))
            )
            .andExpect(status().isOk());

        // Validate the PersonProfile in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersonProfileUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedPersonProfile, personProfile),
            getPersistedPersonProfile(personProfile)
        );
    }

    @Test
    @Transactional
    void fullUpdatePersonProfileWithPatch() throws Exception {
        // Initialize the database
        insertedPersonProfile = personProfileRepository.saveAndFlush(personProfile);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the personProfile using partial update
        PersonProfile partialUpdatedPersonProfile = new PersonProfile();
        partialUpdatedPersonProfile.setId(personProfile.getId());

        partialUpdatedPersonProfile
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .dob(UPDATED_DOB)
            .gender(UPDATED_GENDER)
            .bio(UPDATED_BIO)
            .interests(UPDATED_INTERESTS)
            .location(UPDATED_LOCATION);

        restPersonProfileMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPersonProfile.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPersonProfile))
            )
            .andExpect(status().isOk());

        // Validate the PersonProfile in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersonProfileUpdatableFieldsEquals(partialUpdatedPersonProfile, getPersistedPersonProfile(partialUpdatedPersonProfile));
    }

    @Test
    @Transactional
    void patchNonExistingPersonProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        personProfile.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPersonProfileMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, personProfile.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(personProfile))
            )
            .andExpect(status().isBadRequest());

        // Validate the PersonProfile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPersonProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        personProfile.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPersonProfileMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(personProfile))
            )
            .andExpect(status().isBadRequest());

        // Validate the PersonProfile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPersonProfile() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        personProfile.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPersonProfileMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(personProfile))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the PersonProfile in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePersonProfile() throws Exception {
        // Initialize the database
        insertedPersonProfile = personProfileRepository.saveAndFlush(personProfile);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the personProfile
        restPersonProfileMockMvc
            .perform(delete(ENTITY_API_URL_ID, personProfile.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return personProfileRepository.count();
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

    protected PersonProfile getPersistedPersonProfile(PersonProfile personProfile) {
        return personProfileRepository.findById(personProfile.getId()).orElseThrow();
    }

    protected void assertPersistedPersonProfileToMatchAllProperties(PersonProfile expectedPersonProfile) {
        assertPersonProfileAllPropertiesEquals(expectedPersonProfile, getPersistedPersonProfile(expectedPersonProfile));
    }

    protected void assertPersistedPersonProfileToMatchUpdatableProperties(PersonProfile expectedPersonProfile) {
        assertPersonProfileAllUpdatablePropertiesEquals(expectedPersonProfile, getPersistedPersonProfile(expectedPersonProfile));
    }
}
