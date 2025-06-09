package com.meet.singles.repository;

import com.meet.singles.domain.UserEvent;
import com.meet.singles.domain.PersonProfile;
import com.meet.singles.domain.Event;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the UserEvent entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserEventRepository extends JpaRepository<UserEvent, Long> {
    
    /**
     * Find all UserEvents by event ID
     */
    List<UserEvent> findByEventId(Long eventId);
    
    /**
     * Find all UserEvents by event ID with PersonProfile data eagerly loaded
     */
    @Query("SELECT ue FROM UserEvent ue LEFT JOIN FETCH ue.personProfile pp LEFT JOIN FETCH pp.internalUser WHERE ue.event.id = :eventId")
    List<UserEvent> findByEventIdWithPersonProfile(@Param("eventId") Long eventId);
    
    /**
     * Find UserEvent by PersonProfile and Event
     */
    Optional<UserEvent> findByPersonProfileAndEvent(PersonProfile personProfile, Event event);
}
