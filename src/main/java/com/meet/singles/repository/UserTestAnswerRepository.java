package com.meet.singles.repository;

import com.meet.singles.domain.UserTestAnswer;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the UserTestAnswer entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserTestAnswerRepository extends JpaRepository<UserTestAnswer, Long> {}
