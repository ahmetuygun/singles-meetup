package com.meet.singles.domain;

import static com.meet.singles.domain.EventTestSamples.*;
import static com.meet.singles.domain.PersonProfileTestSamples.*;
import static com.meet.singles.domain.UserTestAnswerTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.meet.singles.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class PersonProfileTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PersonProfile.class);
        PersonProfile personProfile1 = getPersonProfileSample1();
        PersonProfile personProfile2 = new PersonProfile();
        assertThat(personProfile1).isNotEqualTo(personProfile2);

        personProfile2.setId(personProfile1.getId());
        assertThat(personProfile1).isEqualTo(personProfile2);

        personProfile2 = getPersonProfileSample2();
        assertThat(personProfile1).isNotEqualTo(personProfile2);
    }

    @Test
    void answersTest() {
        PersonProfile personProfile = getPersonProfileRandomSampleGenerator();
        UserTestAnswer userTestAnswerBack = getUserTestAnswerRandomSampleGenerator();

        personProfile.addAnswers(userTestAnswerBack);
        assertThat(personProfile.getAnswers()).containsOnly(userTestAnswerBack);
        assertThat(userTestAnswerBack.getPersonProfile()).isEqualTo(personProfile);

        personProfile.removeAnswers(userTestAnswerBack);
        assertThat(personProfile.getAnswers()).doesNotContain(userTestAnswerBack);
        assertThat(userTestAnswerBack.getPersonProfile()).isNull();

        personProfile.answers(new HashSet<>(Set.of(userTestAnswerBack)));
        assertThat(personProfile.getAnswers()).containsOnly(userTestAnswerBack);
        assertThat(userTestAnswerBack.getPersonProfile()).isEqualTo(personProfile);

        personProfile.setAnswers(new HashSet<>());
        assertThat(personProfile.getAnswers()).doesNotContain(userTestAnswerBack);
        assertThat(userTestAnswerBack.getPersonProfile()).isNull();
    }

    @Test
    void eventsTest() {
        PersonProfile personProfile = getPersonProfileRandomSampleGenerator();
        Event eventBack = getEventRandomSampleGenerator();

        personProfile.addEvents(eventBack);
        assertThat(personProfile.getEvents()).containsOnly(eventBack);

        personProfile.removeEvents(eventBack);
        assertThat(personProfile.getEvents()).doesNotContain(eventBack);

        personProfile.events(new HashSet<>(Set.of(eventBack)));
        assertThat(personProfile.getEvents()).containsOnly(eventBack);

        personProfile.setEvents(new HashSet<>());
        assertThat(personProfile.getEvents()).doesNotContain(eventBack);
    }
}
