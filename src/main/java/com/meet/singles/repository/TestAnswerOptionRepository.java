package com.meet.singles.repository;

import com.meet.singles.domain.TestAnswerOption;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TestAnswerOption entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TestAnswerOptionRepository extends JpaRepository<TestAnswerOption, Long> {}
