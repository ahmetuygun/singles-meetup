package com.meet.singles.repository;

import com.meet.singles.domain.UserTicket;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the UserTicket entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserTicketRepository extends JpaRepository<UserTicket, Long> {
    
    @Query("SELECT ut FROM UserTicket ut JOIN FETCH ut.ticket t JOIN FETCH t.event e WHERE ut.personProfile.id = :personProfileId ORDER BY ut.purchaseDate DESC")
    List<UserTicket> findByPersonProfileIdWithTicketAndEvent(Long personProfileId);
    
    List<UserTicket> findByPersonProfileId(Long personProfileId);
    
    List<UserTicket> findByPersonProfileIdAndTicketEventId(Long personProfileId, Long eventId);
    
    List<UserTicket> findByTicketEventId(Long eventId);
} 