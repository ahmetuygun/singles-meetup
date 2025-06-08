package com.meet.singles.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A TestAnswerOption.
 */
@Entity
@Table(name = "test_answer_option")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TestAnswerOption implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "option_text", nullable = false)
    private String optionText;

    @Column(name = "value")
    private Integer value;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "answer")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "question", "personProfile", "answer" }, allowSetters = true)
    private Set<UserTestAnswer> selectedAnswers = new HashSet<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties(value = { "options", "answers" }, allowSetters = true)
    private TestQuestion question;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public TestAnswerOption id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOptionText() {
        return this.optionText;
    }

    public TestAnswerOption optionText(String optionText) {
        this.setOptionText(optionText);
        return this;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public Integer getValue() {
        return this.value;
    }

    public TestAnswerOption value(Integer value) {
        this.setValue(value);
        return this;
    }

    public void setValue(Integer value) {
        this.value = value;
    }

    public Set<UserTestAnswer> getSelectedAnswers() {
        return this.selectedAnswers;
    }

    public void setSelectedAnswers(Set<UserTestAnswer> userTestAnswers) {
        if (this.selectedAnswers != null) {
            this.selectedAnswers.forEach(i -> i.setAnswer(null));
        }
        if (userTestAnswers != null) {
            userTestAnswers.forEach(i -> i.setAnswer(this));
        }
        this.selectedAnswers = userTestAnswers;
    }

    public TestAnswerOption selectedAnswers(Set<UserTestAnswer> userTestAnswers) {
        this.setSelectedAnswers(userTestAnswers);
        return this;
    }

    public TestAnswerOption addSelectedAnswers(UserTestAnswer userTestAnswer) {
        this.selectedAnswers.add(userTestAnswer);
        userTestAnswer.setAnswer(this);
        return this;
    }

    public TestAnswerOption removeSelectedAnswers(UserTestAnswer userTestAnswer) {
        this.selectedAnswers.remove(userTestAnswer);
        userTestAnswer.setAnswer(null);
        return this;
    }

    public TestQuestion getQuestion() {
        return this.question;
    }

    public void setQuestion(TestQuestion testQuestion) {
        this.question = testQuestion;
    }

    public TestAnswerOption question(TestQuestion testQuestion) {
        this.setQuestion(testQuestion);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TestAnswerOption)) {
            return false;
        }
        return getId() != null && getId().equals(((TestAnswerOption) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TestAnswerOption{" +
            "id=" + getId() +
            ", optionText='" + getOptionText() + "'" +
            ", value=" + getValue() +
            "}";
    }
}
