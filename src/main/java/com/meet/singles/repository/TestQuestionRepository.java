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
    @Query("SELECT DISTINCT q FROM TestQuestion q LEFT JOIN FETCH q.options ORDER BY q.stepNumber ASC, q.id ASC")
    List<TestQuestion> findAllWithOptions();
    
    @Query("SELECT q FROM TestQuestion q ORDER BY q.stepNumber ASC, q.id ASC")
    List<TestQuestion> findAll();
}
