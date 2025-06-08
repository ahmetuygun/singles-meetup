package com.meet.singles.repository;

import com.meet.singles.domain.Ticket;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Ticket entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    List<Ticket> findByEventIdAndIsActiveTrue(Long eventId);
    
    List<Ticket> findByEventId(Long eventId);
} 