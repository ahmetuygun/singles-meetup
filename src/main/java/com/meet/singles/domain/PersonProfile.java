package com.meet.singles.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A PersonProfile.
 */
@Entity
@Table(name = "person_profile")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PersonProfile implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotNull
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @NotNull
    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @NotNull
    @Column(name = "gender", nullable = false)
    private String gender;

    @Column(name = "bio")
    private String bio;

    @Column(name = "interests")
    private String interests;

    @Column(name = "location")
    private String location;

    @Column(name = "test_completed", nullable = false)
    private Boolean testCompleted = false;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private User internalUser;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "personProfile")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "question", "personProfile", "answer" }, allowSetters = true)
    private Set<UserTestAnswer> answers = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "rel_person_profile__events",
        joinColumns = @JoinColumn(name = "person_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "events_id")
    )
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "venue", "participants" }, allowSetters = true)
    private Set<Event> events = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public PersonProfile id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return this.firstName;
    }

    public PersonProfile firstName(String firstName) {
        this.setFirstName(firstName);
        return this;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return this.lastName;
    }

    public PersonProfile lastName(String lastName) {
        this.setLastName(lastName);
        return this;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public LocalDate getDob() {
        return this.dob;
    }

    public PersonProfile dob(LocalDate dob) {
        this.setDob(dob);
        return this;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getGender() {
        return this.gender;
    }

    public PersonProfile gender(String gender) {
        this.setGender(gender);
        return this;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBio() {
        return this.bio;
    }

    public PersonProfile bio(String bio) {
        this.setBio(bio);
        return this;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getInterests() {
        return this.interests;
    }

    public PersonProfile interests(String interests) {
        this.setInterests(interests);
        return this;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public String getLocation() {
        return this.location;
    }

    public PersonProfile location(String location) {
        this.setLocation(location);
        return this;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Boolean getTestCompleted() {
        return this.testCompleted;
    }

    public PersonProfile testCompleted(Boolean testCompleted) {
        this.setTestCompleted(testCompleted);
        return this;
    }

    public void setTestCompleted(Boolean testCompleted) {
        this.testCompleted = testCompleted;
    }

    public User getInternalUser() {
        return this.internalUser;
    }

    public void setInternalUser(User user) {
        this.internalUser = user;
    }

    public PersonProfile internalUser(User user) {
        this.setInternalUser(user);
        return this;
    }

    public Set<UserTestAnswer> getAnswers() {
        return this.answers;
    }

    public void setAnswers(Set<UserTestAnswer> userTestAnswers) {
        if (this.answers != null) {
            this.answers.forEach(i -> i.setPersonProfile(null));
        }
        if (userTestAnswers != null) {
            userTestAnswers.forEach(i -> i.setPersonProfile(this));
        }
        this.answers = userTestAnswers;
    }

    public PersonProfile answers(Set<UserTestAnswer> userTestAnswers) {
        this.setAnswers(userTestAnswers);
        return this;
    }

    public PersonProfile addAnswers(UserTestAnswer userTestAnswer) {
        this.answers.add(userTestAnswer);
        userTestAnswer.setPersonProfile(this);
        return this;
    }

    public PersonProfile removeAnswers(UserTestAnswer userTestAnswer) {
        this.answers.remove(userTestAnswer);
        userTestAnswer.setPersonProfile(null);
        return this;
    }

    public Set<Event> getEvents() {
        return this.events;
    }

    public void setEvents(Set<Event> events) {
        this.events = events;
    }

    public PersonProfile events(Set<Event> events) {
        this.setEvents(events);
        return this;
    }

    public PersonProfile addEvents(Event event) {
        this.events.add(event);
        return this;
    }

    public PersonProfile removeEvents(Event event) {
        this.events.remove(event);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PersonProfile)) {
            return false;
        }
        return getId() != null && getId().equals(((PersonProfile) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PersonProfile{" +
            "id=" + getId() +
            ", firstName='" + getFirstName() + "'" +
            ", lastName='" + getLastName() + "'" +
            ", dob='" + getDob() + "'" +
            ", gender='" + getGender() + "'" +
            ", bio='" + getBio() + "'" +
            ", interests='" + getInterests() + "'" +
            ", location='" + getLocation() + "'" +
            ", testCompleted='" + getTestCompleted() + "'" +
            "}";
    }
}
