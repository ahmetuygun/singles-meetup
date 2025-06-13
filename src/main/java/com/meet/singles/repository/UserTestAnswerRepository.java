package com.meet.singles.repository;

import com.meet.singles.domain.PersonProfile;
import com.meet.singles.domain.UserTestAnswer;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the UserTestAnswer entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserTestAnswerRepository extends JpaRepository<UserTestAnswer, Long> {
    
    List<UserTestAnswer> findByPersonProfile(PersonProfile personProfile);
}
