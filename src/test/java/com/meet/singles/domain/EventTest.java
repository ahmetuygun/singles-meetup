package com.meet.singles.domain;

import static com.meet.singles.domain.EventTestSamples.*;
import static com.meet.singles.domain.PersonProfileTestSamples.*;
import static com.meet.singles.domain.VenueTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.meet.singles.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class EventTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Event.class);
        Event event1 = getEventSample1();
        Event event2 = new Event();
        assertThat(event1).isNotEqualTo(event2);

        event2.setId(event1.getId());
        assertThat(event1).isEqualTo(event2);

        event2 = getEventSample2();
        assertThat(event1).isNotEqualTo(event2);
    }

    @Test
    void venueTest() {
        Event event = getEventRandomSampleGenerator();
        Venue venueBack = getVenueRandomSampleGenerator();

        event.setVenue(venueBack);
        assertThat(event.getVenue()).isEqualTo(venueBack);

        event.venue(null);
        assertThat(event.getVenue()).isNull();
    }

    @Test
    void participantsTest() {
        Event event = getEventRandomSampleGenerator();
        PersonProfile personProfileBack = getPersonProfileRandomSampleGenerator();

        event.addParticipants(personProfileBack);
        assertThat(event.getParticipants()).containsOnly(personProfileBack);
        assertThat(personProfileBack.getEvents()).containsOnly(event);

        event.removeParticipants(personProfileBack);
        assertThat(event.getParticipants()).doesNotContain(personProfileBack);
        assertThat(personProfileBack.getEvents()).doesNotContain(event);

        event.participants(new HashSet<>(Set.of(personProfileBack)));
        assertThat(event.getParticipants()).containsOnly(personProfileBack);
        assertThat(personProfileBack.getEvents()).containsOnly(event);

        event.setParticipants(new HashSet<>());
        assertThat(event.getParticipants()).doesNotContain(personProfileBack);
        assertThat(personProfileBack.getEvents()).doesNotContain(event);
    }
}
