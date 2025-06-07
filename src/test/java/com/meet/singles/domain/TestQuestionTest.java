package com.meet.singles.domain;

import static com.meet.singles.domain.TestAnswerOptionTestSamples.*;
import static com.meet.singles.domain.TestQuestionTestSamples.*;
import static com.meet.singles.domain.UserTestAnswerTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.meet.singles.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class TestQuestionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TestQuestion.class);
        TestQuestion testQuestion1 = getTestQuestionSample1();
        TestQuestion testQuestion2 = new TestQuestion();
        assertThat(testQuestion1).isNotEqualTo(testQuestion2);

        testQuestion2.setId(testQuestion1.getId());
        assertThat(testQuestion1).isEqualTo(testQuestion2);

        testQuestion2 = getTestQuestionSample2();
        assertThat(testQuestion1).isNotEqualTo(testQuestion2);
    }

    @Test
    void optionsTest() {
        TestQuestion testQuestion = getTestQuestionRandomSampleGenerator();
        TestAnswerOption testAnswerOptionBack = getTestAnswerOptionRandomSampleGenerator();

        testQuestion.addOptions(testAnswerOptionBack);
        assertThat(testQuestion.getOptions()).containsOnly(testAnswerOptionBack);
        assertThat(testAnswerOptionBack.getQuestion()).isEqualTo(testQuestion);

        testQuestion.removeOptions(testAnswerOptionBack);
        assertThat(testQuestion.getOptions()).doesNotContain(testAnswerOptionBack);
        assertThat(testAnswerOptionBack.getQuestion()).isNull();

        testQuestion.options(new HashSet<>(Set.of(testAnswerOptionBack)));
        assertThat(testQuestion.getOptions()).containsOnly(testAnswerOptionBack);
        assertThat(testAnswerOptionBack.getQuestion()).isEqualTo(testQuestion);

        testQuestion.setOptions(new HashSet<>());
        assertThat(testQuestion.getOptions()).doesNotContain(testAnswerOptionBack);
        assertThat(testAnswerOptionBack.getQuestion()).isNull();
    }

    @Test
    void answersTest() {
        TestQuestion testQuestion = getTestQuestionRandomSampleGenerator();
        UserTestAnswer userTestAnswerBack = getUserTestAnswerRandomSampleGenerator();

        testQuestion.addAnswers(userTestAnswerBack);
        assertThat(testQuestion.getAnswers()).containsOnly(userTestAnswerBack);
        assertThat(userTestAnswerBack.getQuestion()).isEqualTo(testQuestion);

        testQuestion.removeAnswers(userTestAnswerBack);
        assertThat(testQuestion.getAnswers()).doesNotContain(userTestAnswerBack);
        assertThat(userTestAnswerBack.getQuestion()).isNull();

        testQuestion.answers(new HashSet<>(Set.of(userTestAnswerBack)));
        assertThat(testQuestion.getAnswers()).containsOnly(userTestAnswerBack);
        assertThat(userTestAnswerBack.getQuestion()).isEqualTo(testQuestion);

        testQuestion.setAnswers(new HashSet<>());
        assertThat(testQuestion.getAnswers()).doesNotContain(userTestAnswerBack);
        assertThat(userTestAnswerBack.getQuestion()).isNull();
    }
}
