package com.meet.singles.repository;

import com.meet.singles.domain.TestQuestion;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TestQuestion entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TestQuestionRepository extends JpaRepository<TestQuestion, Long> {}
