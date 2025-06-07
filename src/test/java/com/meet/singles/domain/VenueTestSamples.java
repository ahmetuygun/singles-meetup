package com.meet.singles.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class VenueTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Venue getVenueSample1() {
        return new Venue()
            .id(1L)
            .name("name1")
            .address("address1")
            .city("city1")
            .capacity(1)
            .contactInfo("contactInfo1")
            .photoUrl("photoUrl1");
    }

    public static Venue getVenueSample2() {
        return new Venue()
            .id(2L)
            .name("name2")
            .address("address2")
            .city("city2")
            .capacity(2)
            .contactInfo("contactInfo2")
            .photoUrl("photoUrl2");
    }

    public static Venue getVenueRandomSampleGenerator() {
        return new Venue()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .address(UUID.randomUUID().toString())
            .city(UUID.randomUUID().toString())
            .capacity(intCount.incrementAndGet())
            .contactInfo(UUID.randomUUID().toString())
            .photoUrl(UUID.randomUUID().toString());
    }
}
