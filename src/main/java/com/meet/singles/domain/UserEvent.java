package com.meet.singles.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.meet.singles.domain.enumeration.PaymentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A UserEvent.
 */
@Entity
@Table(name = "user_event")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UserEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "status")
    private String status;

    @Column(name = "checked_in")
    private Boolean checkedIn;

    @Column(name = "match_completed")
    private Boolean matchCompleted;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "internalUser", "answers", "events" }, allowSetters = true)
    private PersonProfile personProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "venue", "participants" }, allowSetters = true)
    private Event event;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public UserEvent id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return this.status;
    }

    public UserEvent status(String status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getCheckedIn() {
        return this.checkedIn;
    }

    public UserEvent checkedIn(Boolean checkedIn) {
        this.setCheckedIn(checkedIn);
        return this;
    }

    public void setCheckedIn(Boolean checkedIn) {
        this.checkedIn = checkedIn;
    }

    public Boolean getMatchCompleted() {
        return this.matchCompleted;
    }

    public UserEvent matchCompleted(Boolean matchCompleted) {
        this.setMatchCompleted(matchCompleted);
        return this;
    }

    public void setMatchCompleted(Boolean matchCompleted) {
        this.matchCompleted = matchCompleted;
    }

    public PaymentStatus getPaymentStatus() {
        return this.paymentStatus;
    }

    public UserEvent paymentStatus(PaymentStatus paymentStatus) {
        this.setPaymentStatus(paymentStatus);
        return this;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public PersonProfile getPersonProfile() {
        return this.personProfile;
    }

    public void setPersonProfile(PersonProfile personProfile) {
        this.personProfile = personProfile;
    }

    public UserEvent personProfile(PersonProfile personProfile) {
        this.setPersonProfile(personProfile);
        return this;
    }

    public Event getEvent() {
        return this.event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public UserEvent event(Event event) {
        this.setEvent(event);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserEvent)) {
            return false;
        }
        return getId() != null && getId().equals(((UserEvent) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserEvent{" +
            "id=" + getId() +
            ", status='" + getStatus() + "'" +
            ", checkedIn='" + getCheckedIn() + "'" +
            ", matchCompleted='" + getMatchCompleted() + "'" +
            ", paymentStatus='" + getPaymentStatus() + "'" +
            "}";
    }
}
