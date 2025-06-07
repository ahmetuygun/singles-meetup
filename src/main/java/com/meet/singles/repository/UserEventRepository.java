package com.meet.singles.repository;

import com.meet.singles.domain.UserEvent;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the UserEvent entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserEventRepository extends JpaRepository<UserEvent, Long> {}
