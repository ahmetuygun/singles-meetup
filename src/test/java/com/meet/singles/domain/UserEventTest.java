package com.meet.singles.domain;

import static com.meet.singles.domain.EventTestSamples.*;
import static com.meet.singles.domain.PersonProfileTestSamples.*;
import static com.meet.singles.domain.UserEventTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.meet.singles.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class UserEventTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(UserEvent.class);
        UserEvent userEvent1 = getUserEventSample1();
        UserEvent userEvent2 = new UserEvent();
        assertThat(userEvent1).isNotEqualTo(userEvent2);

        userEvent2.setId(userEvent1.getId());
        assertThat(userEvent1).isEqualTo(userEvent2);

        userEvent2 = getUserEventSample2();
        assertThat(userEvent1).isNotEqualTo(userEvent2);
    }

    @Test
    void personProfileTest() {
        UserEvent userEvent = getUserEventRandomSampleGenerator();
        PersonProfile personProfileBack = getPersonProfileRandomSampleGenerator();

        userEvent.setPersonProfile(personProfileBack);
        assertThat(userEvent.getPersonProfile()).isEqualTo(personProfileBack);

        userEvent.personProfile(null);
        assertThat(userEvent.getPersonProfile()).isNull();
    }

    @Test
    void eventTest() {
        UserEvent userEvent = getUserEventRandomSampleGenerator();
        Event eventBack = getEventRandomSampleGenerator();

        userEvent.setEvent(eventBack);
        assertThat(userEvent.getEvent()).isEqualTo(eventBack);

        userEvent.event(null);
        assertThat(userEvent.getEvent()).isNull();
    }
}
