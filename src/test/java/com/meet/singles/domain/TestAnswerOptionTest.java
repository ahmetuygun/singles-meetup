package com.meet.singles.domain;

import static com.meet.singles.domain.TestAnswerOptionTestSamples.*;
import static com.meet.singles.domain.TestQuestionTestSamples.*;
import static com.meet.singles.domain.UserTestAnswerTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.meet.singles.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class TestAnswerOptionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TestAnswerOption.class);
        TestAnswerOption testAnswerOption1 = getTestAnswerOptionSample1();
        TestAnswerOption testAnswerOption2 = new TestAnswerOption();
        assertThat(testAnswerOption1).isNotEqualTo(testAnswerOption2);

        testAnswerOption2.setId(testAnswerOption1.getId());
        assertThat(testAnswerOption1).isEqualTo(testAnswerOption2);

        testAnswerOption2 = getTestAnswerOptionSample2();
        assertThat(testAnswerOption1).isNotEqualTo(testAnswerOption2);
    }

    @Test
    void selectedAnswersTest() {
        TestAnswerOption testAnswerOption = getTestAnswerOptionRandomSampleGenerator();
        UserTestAnswer userTestAnswerBack = getUserTestAnswerRandomSampleGenerator();

        testAnswerOption.addSelectedAnswers(userTestAnswerBack);
        assertThat(testAnswerOption.getSelectedAnswers()).containsOnly(userTestAnswerBack);
        assertThat(userTestAnswerBack.getAnswer()).isEqualTo(testAnswerOption);

        testAnswerOption.removeSelectedAnswers(userTestAnswerBack);
        assertThat(testAnswerOption.getSelectedAnswers()).doesNotContain(userTestAnswerBack);
        assertThat(userTestAnswerBack.getAnswer()).isNull();

        testAnswerOption.selectedAnswers(new HashSet<>(Set.of(userTestAnswerBack)));
        assertThat(testAnswerOption.getSelectedAnswers()).containsOnly(userTestAnswerBack);
        assertThat(userTestAnswerBack.getAnswer()).isEqualTo(testAnswerOption);

        testAnswerOption.setSelectedAnswers(new HashSet<>());
        assertThat(testAnswerOption.getSelectedAnswers()).doesNotContain(userTestAnswerBack);
        assertThat(userTestAnswerBack.getAnswer()).isNull();
    }

    @Test
    void questionTest() {
        TestAnswerOption testAnswerOption = getTestAnswerOptionRandomSampleGenerator();
        TestQuestion testQuestionBack = getTestQuestionRandomSampleGenerator();

        testAnswerOption.setQuestion(testQuestionBack);
        assertThat(testAnswerOption.getQuestion()).isEqualTo(testQuestionBack);

        testAnswerOption.question(null);
        assertThat(testAnswerOption.getQuestion()).isNull();
    }
}
