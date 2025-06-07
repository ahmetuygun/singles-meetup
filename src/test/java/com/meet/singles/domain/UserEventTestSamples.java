package com.meet.singles.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class UserEventTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static UserEvent getUserEventSample1() {
        return new UserEvent().id(1L).status("status1");
    }

    public static UserEvent getUserEventSample2() {
        return new UserEvent().id(2L).status("status2");
    }

    public static UserEvent getUserEventRandomSampleGenerator() {
        return new UserEvent().id(longCount.incrementAndGet()).status(UUID.randomUUID().toString());
    }
}
