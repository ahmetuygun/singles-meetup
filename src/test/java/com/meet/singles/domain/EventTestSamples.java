package com.meet.singles.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class EventTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Event getEventSample1() {
        return new Event().id(1L).name("name1").description("description1").maxParticipants(1).status("status1");
    }

    public static Event getEventSample2() {
        return new Event().id(2L).name("name2").description("description2").maxParticipants(2).status("status2");
    }

    public static Event getEventRandomSampleGenerator() {
        return new Event()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString())
            .maxParticipants(intCount.incrementAndGet())
            .status(UUID.randomUUID().toString());
    }
}
