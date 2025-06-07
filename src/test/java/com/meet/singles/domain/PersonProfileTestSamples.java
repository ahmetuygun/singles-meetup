package com.meet.singles.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class PersonProfileTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static PersonProfile getPersonProfileSample1() {
        return new PersonProfile()
            .id(1L)
            .firstName("firstName1")
            .lastName("lastName1")
            .gender("gender1")
            .bio("bio1")
            .interests("interests1")
            .location("location1");
    }

    public static PersonProfile getPersonProfileSample2() {
        return new PersonProfile()
            .id(2L)
            .firstName("firstName2")
            .lastName("lastName2")
            .gender("gender2")
            .bio("bio2")
            .interests("interests2")
            .location("location2");
    }

    public static PersonProfile getPersonProfileRandomSampleGenerator() {
        return new PersonProfile()
            .id(longCount.incrementAndGet())
            .firstName(UUID.randomUUID().toString())
            .lastName(UUID.randomUUID().toString())
            .gender(UUID.randomUUID().toString())
            .bio(UUID.randomUUID().toString())
            .interests(UUID.randomUUID().toString())
            .location(UUID.randomUUID().toString());
    }
}
