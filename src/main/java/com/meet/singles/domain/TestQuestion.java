package com.meet.singles.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.meet.singles.domain.enumeration.QuestionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A TestQuestion.
 */
@Entity
@Table(name = "test_question")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TestQuestion implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "question_text", nullable = false)
    private String questionText;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Column(name = "step_number")
    private Integer stepNumber;

    @NotNull
    @Column(name = "is_required", nullable = false)
    private Boolean isRequired;

    @Column(name = "category")
    private String category;

    @NotNull
    @Column(name = "language", nullable = false)
    private String language;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "selectedAnswers", "question" }, allowSetters = true)
    private Set<TestAnswerOption> options = new HashSet<>();

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "question")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "question", "personProfile", "answer" }, allowSetters = true)
    private Set<UserTestAnswer> answers = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public TestQuestion id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return this.questionText;
    }

    public TestQuestion questionText(String questionText) {
        this.setQuestionText(questionText);
        return this;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public QuestionType getQuestionType() {
        return this.questionType;
    }

    public TestQuestion questionType(QuestionType questionType) {
        this.setQuestionType(questionType);
        return this;
    }

    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

    public Integer getStepNumber() {
        return this.stepNumber;
    }

    public TestQuestion stepNumber(Integer stepNumber) {
        this.setStepNumber(stepNumber);
        return this;
    }

    public void setStepNumber(Integer stepNumber) {
        this.stepNumber = stepNumber;
    }

    public Boolean getIsRequired() {
        return this.isRequired;
    }

    public TestQuestion isRequired(Boolean isRequired) {
        this.setIsRequired(isRequired);
        return this;
    }

    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }

    public String getCategory() {
        return this.category;
    }

    public TestQuestion category(String category) {
        this.setCategory(category);
        return this;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLanguage() {
        return this.language;
    }

    public TestQuestion language(String language) {
        this.setLanguage(language);
        return this;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Set<TestAnswerOption> getOptions() {
        return this.options;
    }

    public void setOptions(Set<TestAnswerOption> testAnswerOptions) {
        if (this.options != null) {
            this.options.forEach(i -> i.setQuestion(null));
        }
        if (testAnswerOptions != null) {
            testAnswerOptions.forEach(i -> i.setQuestion(this));
        }
        this.options = testAnswerOptions;
    }

    public TestQuestion options(Set<TestAnswerOption> testAnswerOptions) {
        this.setOptions(testAnswerOptions);
        return this;
    }

    public TestQuestion addOptions(TestAnswerOption testAnswerOption) {
        this.options.add(testAnswerOption);
        testAnswerOption.setQuestion(this);
        return this;
    }

    public TestQuestion removeOptions(TestAnswerOption testAnswerOption) {
        this.options.remove(testAnswerOption);
        testAnswerOption.setQuestion(null);
        return this;
    }

    public Set<UserTestAnswer> getAnswers() {
        return this.answers;
    }

    public void setAnswers(Set<UserTestAnswer> userTestAnswers) {
        if (this.answers != null) {
            this.answers.forEach(i -> i.setQuestion(null));
        }
        if (userTestAnswers != null) {
            userTestAnswers.forEach(i -> i.setQuestion(this));
        }
        this.answers = userTestAnswers;
    }

    public TestQuestion answers(Set<UserTestAnswer> userTestAnswers) {
        this.setAnswers(userTestAnswers);
        return this;
    }

    public TestQuestion addAnswers(UserTestAnswer userTestAnswer) {
        this.answers.add(userTestAnswer);
        userTestAnswer.setQuestion(this);
        return this;
    }

    public TestQuestion removeAnswers(UserTestAnswer userTestAnswer) {
        this.answers.remove(userTestAnswer);
        userTestAnswer.setQuestion(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TestQuestion)) {
            return false;
        }
        return getId() != null && getId().equals(((TestQuestion) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TestQuestion{" +
            "id=" + getId() +
            ", questionText='" + getQuestionText() + "'" +
            ", questionType='" + getQuestionType() + "'" +
            ", stepNumber=" + getStepNumber() +
            ", isRequired='" + getIsRequired() + "'" +
            ", category='" + getCategory() + "'" +
            ", language='" + getLanguage() + "'" +
            "}";
    }
}
