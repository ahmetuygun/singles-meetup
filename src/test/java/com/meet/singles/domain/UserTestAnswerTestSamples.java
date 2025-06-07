package com.meet.singles.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class UserTestAnswerTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static UserTestAnswer getUserTestAnswerSample1() {
        return new UserTestAnswer().id(1L).answerValue(1);
    }

    public static UserTestAnswer getUserTestAnswerSample2() {
        return new UserTestAnswer().id(2L).answerValue(2);
    }

    public static UserTestAnswer getUserTestAnswerRandomSampleGenerator() {
        return new UserTestAnswer().id(longCount.incrementAndGet()).answerValue(intCount.incrementAndGet());
    }
}
