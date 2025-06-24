package com.meet.singles.repository;

import com.meet.singles.domain.Event;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the Event entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    @Query("SELECT e FROM Event e LEFT JOIN FETCH e.venue")
    List<Event> findAllWithVenue();
    
    @Query("SELECT e FROM Event e LEFT JOIN FETCH e.venue WHERE e.id = :id")
    Optional<Event> findByIdWithVenue(@Param("id") Long id);
}
