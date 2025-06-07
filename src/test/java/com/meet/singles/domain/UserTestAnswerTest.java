package com.meet.singles.domain;

import static com.meet.singles.domain.PersonProfileTestSamples.*;
import static com.meet.singles.domain.TestAnswerOptionTestSamples.*;
import static com.meet.singles.domain.TestQuestionTestSamples.*;
import static com.meet.singles.domain.UserTestAnswerTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.meet.singles.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class UserTestAnswerTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(UserTestAnswer.class);
        UserTestAnswer userTestAnswer1 = getUserTestAnswerSample1();
        UserTestAnswer userTestAnswer2 = new UserTestAnswer();
        assertThat(userTestAnswer1).isNotEqualTo(userTestAnswer2);

        userTestAnswer2.setId(userTestAnswer1.getId());
        assertThat(userTestAnswer1).isEqualTo(userTestAnswer2);

        userTestAnswer2 = getUserTestAnswerSample2();
        assertThat(userTestAnswer1).isNotEqualTo(userTestAnswer2);
    }

    @Test
    void questionTest() {
        UserTestAnswer userTestAnswer = getUserTestAnswerRandomSampleGenerator();
        TestQuestion testQuestionBack = getTestQuestionRandomSampleGenerator();

        userTestAnswer.setQuestion(testQuestionBack);
        assertThat(userTestAnswer.getQuestion()).isEqualTo(testQuestionBack);

        userTestAnswer.question(null);
        assertThat(userTestAnswer.getQuestion()).isNull();
    }

    @Test
    void personProfileTest() {
        UserTestAnswer userTestAnswer = getUserTestAnswerRandomSampleGenerator();
        PersonProfile personProfileBack = getPersonProfileRandomSampleGenerator();

        userTestAnswer.setPersonProfile(personProfileBack);
        assertThat(userTestAnswer.getPersonProfile()).isEqualTo(personProfileBack);

        userTestAnswer.personProfile(null);
        assertThat(userTestAnswer.getPersonProfile()).isNull();
    }

    @Test
    void answerTest() {
        UserTestAnswer userTestAnswer = getUserTestAnswerRandomSampleGenerator();
        TestAnswerOption testAnswerOptionBack = getTestAnswerOptionRandomSampleGenerator();

        userTestAnswer.setAnswer(testAnswerOptionBack);
        assertThat(userTestAnswer.getAnswer()).isEqualTo(testAnswerOptionBack);

        userTestAnswer.answer(null);
        assertThat(userTestAnswer.getAnswer()).isNull();
    }
}
