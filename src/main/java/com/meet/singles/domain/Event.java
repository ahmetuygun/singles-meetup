package com.meet.singles.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Event.
 */
@Entity
@Table(name = "event")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Event implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @NotNull
    @Column(name = "event_date", nullable = false)
    private ZonedDateTime eventDate;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "status")
    private String status;

    @NotNull
    @Column(name = "price", precision = 21, scale = 2, nullable = false)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    private Venue venue;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "events")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "internalUser", "answers", "events" }, allowSetters = true)
    private Set<PersonProfile> participants = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Event id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Event name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Event description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ZonedDateTime getEventDate() {
        return this.eventDate;
    }

    public Event eventDate(ZonedDateTime eventDate) {
        this.setEventDate(eventDate);
        return this;
    }

    public void setEventDate(ZonedDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public Integer getMaxParticipants() {
        return this.maxParticipants;
    }

    public Event maxParticipants(Integer maxParticipants) {
        this.setMaxParticipants(maxParticipants);
        return this;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public String getStatus() {
        return this.status;
    }

    public Event status(String status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getPrice() {
        return this.price;
    }

    public Event price(BigDecimal price) {
        this.setPrice(price);
        return this;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Venue getVenue() {
        return this.venue;
    }

    public void setVenue(Venue venue) {
        this.venue = venue;
    }

    public Event venue(Venue venue) {
        this.setVenue(venue);
        return this;
    }

    public Set<PersonProfile> getParticipants() {
        return this.participants;
    }

    public void setParticipants(Set<PersonProfile> personProfiles) {
        if (this.participants != null) {
            this.participants.forEach(i -> i.removeEvents(this));
        }
        if (personProfiles != null) {
            personProfiles.forEach(i -> i.addEvents(this));
        }
        this.participants = personProfiles;
    }

    public Event participants(Set<PersonProfile> personProfiles) {
        this.setParticipants(personProfiles);
        return this;
    }

    public Event addParticipants(PersonProfile personProfile) {
        this.participants.add(personProfile);
        personProfile.getEvents().add(this);
        return this;
    }

    public Event removeParticipants(PersonProfile personProfile) {
        this.participants.remove(personProfile);
        personProfile.getEvents().remove(this);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Event)) {
            return false;
        }
        return getId() != null && getId().equals(((Event) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Event{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", eventDate='" + getEventDate() + "'" +
            ", maxParticipants=" + getMaxParticipants() +
            ", status='" + getStatus() + "'" +
            ", price=" + getPrice() +
            "}";
    }
}
