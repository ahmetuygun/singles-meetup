package com.meet.singles.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A UserTestAnswer.
 */
@Entity
@Table(name = "user_test_answer")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UserTestAnswer implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "answer_value", nullable = false)
    private Integer answerValue;

    @Column(name = "timestamp")
    private Instant timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "options", "answers" }, allowSetters = true)
    private TestQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "internalUser", "answers", "events" }, allowSetters = true)
    private PersonProfile personProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "selectedAnswers", "question" }, allowSetters = true)
    private TestAnswerOption answer;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public UserTestAnswer id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getAnswerValue() {
        return this.answerValue;
    }

    public UserTestAnswer answerValue(Integer answerValue) {
        this.setAnswerValue(answerValue);
        return this;
    }

    public void setAnswerValue(Integer answerValue) {
        this.answerValue = answerValue;
    }

    public Instant getTimestamp() {
        return this.timestamp;
    }

    public UserTestAnswer timestamp(Instant timestamp) {
        this.setTimestamp(timestamp);
        return this;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public TestQuestion getQuestion() {
        return this.question;
    }

    public void setQuestion(TestQuestion testQuestion) {
        this.question = testQuestion;
    }

    public UserTestAnswer question(TestQuestion testQuestion) {
        this.setQuestion(testQuestion);
        return this;
    }

    public PersonProfile getPersonProfile() {
        return this.personProfile;
    }

    public void setPersonProfile(PersonProfile personProfile) {
        this.personProfile = personProfile;
    }

    public UserTestAnswer personProfile(PersonProfile personProfile) {
        this.setPersonProfile(personProfile);
        return this;
    }

    public TestAnswerOption getAnswer() {
        return this.answer;
    }

    public void setAnswer(TestAnswerOption testAnswerOption) {
        this.answer = testAnswerOption;
    }

    public UserTestAnswer answer(TestAnswerOption testAnswerOption) {
        this.setAnswer(testAnswerOption);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserTestAnswer)) {
            return false;
        }
        return getId() != null && getId().equals(((UserTestAnswer) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserTestAnswer{" +
            "id=" + getId() +
            ", answerValue=" + getAnswerValue() +
            ", timestamp='" + getTimestamp() + "'" +
            "}";
    }
}
