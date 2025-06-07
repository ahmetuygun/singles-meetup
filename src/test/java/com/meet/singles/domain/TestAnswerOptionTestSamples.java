package com.meet.singles.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class TestAnswerOptionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static TestAnswerOption getTestAnswerOptionSample1() {
        return new TestAnswerOption().id(1L).optionText("optionText1").value(1);
    }

    public static TestAnswerOption getTestAnswerOptionSample2() {
        return new TestAnswerOption().id(2L).optionText("optionText2").value(2);
    }

    public static TestAnswerOption getTestAnswerOptionRandomSampleGenerator() {
        return new TestAnswerOption()
            .id(longCount.incrementAndGet())
            .optionText(UUID.randomUUID().toString())
            .value(intCount.incrementAndGet());
    }
}
