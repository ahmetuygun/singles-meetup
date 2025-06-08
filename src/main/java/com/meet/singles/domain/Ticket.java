package com.meet.singles.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Ticket.
 */
@Entity
@Table(name = "ticket")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Ticket implements Serializable {

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
    @Column(name = "price", precision = 21, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "quantity_available")
    private Integer quantityAvailable;

    @Column(name = "quantity_sold")
    private Integer quantitySold;

    @NotNull
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "gender_restriction")
    private String genderRestriction;

    @Column(name = "early_bird")
    private Boolean earlyBird;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "venue", "participants" }, allowSetters = true)
    private Event event;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Ticket id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Ticket name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Ticket description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return this.price;
    }

    public Ticket price(BigDecimal price) {
        this.setPrice(price);
        return this;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getQuantityAvailable() {
        return this.quantityAvailable;
    }

    public Ticket quantityAvailable(Integer quantityAvailable) {
        this.setQuantityAvailable(quantityAvailable);
        return this;
    }

    public void setQuantityAvailable(Integer quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
    }

    public Integer getQuantitySold() {
        return this.quantitySold;
    }

    public Ticket quantitySold(Integer quantitySold) {
        this.setQuantitySold(quantitySold);
        return this;
    }

    public void setQuantitySold(Integer quantitySold) {
        this.quantitySold = quantitySold;
    }

    public Boolean getIsActive() {
        return this.isActive;
    }

    public Ticket isActive(Boolean isActive) {
        this.setIsActive(isActive);
        return this;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getGenderRestriction() {
        return this.genderRestriction;
    }

    public Ticket genderRestriction(String genderRestriction) {
        this.setGenderRestriction(genderRestriction);
        return this;
    }

    public void setGenderRestriction(String genderRestriction) {
        this.genderRestriction = genderRestriction;
    }

    public Boolean getEarlyBird() {
        return this.earlyBird;
    }

    public Ticket earlyBird(Boolean earlyBird) {
        this.setEarlyBird(earlyBird);
        return this;
    }

    public void setEarlyBird(Boolean earlyBird) {
        this.earlyBird = earlyBird;
    }

    public Event getEvent() {
        return this.event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Ticket event(Event event) {
        this.setEvent(event);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Ticket)) {
            return false;
        }
        return getId() != null && getId().equals(((Ticket) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Ticket{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", price=" + getPrice() +
            ", quantityAvailable=" + getQuantityAvailable() +
            ", quantitySold=" + getQuantitySold() +
            ", isActive='" + getIsActive() + "'" +
            ", genderRestriction='" + getGenderRestriction() + "'" +
            ", earlyBird='" + getEarlyBird() + "'" +
            "}";
    }
} 