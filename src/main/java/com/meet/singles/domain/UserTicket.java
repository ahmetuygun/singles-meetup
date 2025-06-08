package com.meet.singles.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.meet.singles.domain.enumeration.PaymentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A UserTicket.
 */
@Entity
@Table(name = "user_ticket")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UserTicket implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull
    @Column(name = "total_price", precision = 21, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "booking_fee", precision = 21, scale = 2)
    private BigDecimal bookingFee;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "purchase_date")
    private ZonedDateTime purchaseDate;

    @Column(name = "ticket_code")
    private String ticketCode;

    @Column(name = "used")
    private Boolean used;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "internalUser", "answers", "events" }, allowSetters = true)
    private PersonProfile personProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { }, allowSetters = true)
    private Ticket ticket;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public UserTicket id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQuantity() {
        return this.quantity;
    }

    public UserTicket quantity(Integer quantity) {
        this.setQuantity(quantity);
        return this;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getTotalPrice() {
        return this.totalPrice;
    }

    public UserTicket totalPrice(BigDecimal totalPrice) {
        this.setTotalPrice(totalPrice);
        return this;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public BigDecimal getBookingFee() {
        return this.bookingFee;
    }

    public UserTicket bookingFee(BigDecimal bookingFee) {
        this.setBookingFee(bookingFee);
        return this;
    }

    public void setBookingFee(BigDecimal bookingFee) {
        this.bookingFee = bookingFee;
    }

    public PaymentStatus getPaymentStatus() {
        return this.paymentStatus;
    }

    public UserTicket paymentStatus(PaymentStatus paymentStatus) {
        this.setPaymentStatus(paymentStatus);
        return this;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return this.paymentMethod;
    }

    public UserTicket paymentMethod(String paymentMethod) {
        this.setPaymentMethod(paymentMethod);
        return this;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public ZonedDateTime getPurchaseDate() {
        return this.purchaseDate;
    }

    public UserTicket purchaseDate(ZonedDateTime purchaseDate) {
        this.setPurchaseDate(purchaseDate);
        return this;
    }

    public void setPurchaseDate(ZonedDateTime purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getTicketCode() {
        return this.ticketCode;
    }

    public UserTicket ticketCode(String ticketCode) {
        this.setTicketCode(ticketCode);
        return this;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public Boolean getUsed() {
        return this.used;
    }

    public UserTicket used(Boolean used) {
        this.setUsed(used);
        return this;
    }

    public void setUsed(Boolean used) {
        this.used = used;
    }

    public PersonProfile getPersonProfile() {
        return this.personProfile;
    }

    public void setPersonProfile(PersonProfile personProfile) {
        this.personProfile = personProfile;
    }

    public UserTicket personProfile(PersonProfile personProfile) {
        this.setPersonProfile(personProfile);
        return this;
    }

    public Ticket getTicket() {
        return this.ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public UserTicket ticket(Ticket ticket) {
        this.setTicket(ticket);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserTicket)) {
            return false;
        }
        return getId() != null && getId().equals(((UserTicket) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserTicket{" +
            "id=" + getId() +
            ", quantity=" + getQuantity() +
            ", totalPrice=" + getTotalPrice() +
            ", bookingFee=" + getBookingFee() +
            ", paymentStatus='" + getPaymentStatus() + "'" +
            ", paymentMethod='" + getPaymentMethod() + "'" +
            ", purchaseDate='" + getPurchaseDate() + "'" +
            ", ticketCode='" + getTicketCode() + "'" +
            ", used='" + getUsed() + "'" +
            "}";
    }
} 