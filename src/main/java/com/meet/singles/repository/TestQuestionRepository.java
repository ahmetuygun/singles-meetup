package com.meet.singles.repository;

import com.meet.singles.domain.TestQuestion;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Spring Data JPA repository for the TestQuestion entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TestQuestionRepository extends JpaRepository<TestQuestion, Long> {
    @Query("SELECT DISTINCT q FROM TestQuestion q LEFT JOIN FETCH q.options")
    List<TestQuestion> findAllWithOptions();
}
