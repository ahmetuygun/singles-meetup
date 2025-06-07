package com.meet.singles.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class TestQuestionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static TestQuestion getTestQuestionSample1() {
        return new TestQuestion().id(1L).questionText("questionText1").stepNumber(1).category("category1").language("language1");
    }

    public static TestQuestion getTestQuestionSample2() {
        return new TestQuestion().id(2L).questionText("questionText2").stepNumber(2).category("category2").language("language2");
    }

    public static TestQuestion getTestQuestionRandomSampleGenerator() {
        return new TestQuestion()
            .id(longCount.incrementAndGet())
            .questionText(UUID.randomUUID().toString())
            .stepNumber(intCount.incrementAndGet())
            .category(UUID.randomUUID().toString())
            .language(UUID.randomUUID().toString());
    }
}
