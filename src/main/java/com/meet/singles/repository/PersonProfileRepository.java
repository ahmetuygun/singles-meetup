package com.meet.singles.repository;

import com.meet.singles.domain.PersonProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the PersonProfile entity.
 *
 * When extending this class, extend PersonProfileRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface PersonProfileRepository extends PersonProfileRepositoryWithBagRelationships, JpaRepository<PersonProfile, Long> {
    default Optional<PersonProfile> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<PersonProfile> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<PersonProfile> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }

    Optional<PersonProfile> findByInternalUserLogin(String login);
    
    List<PersonProfile> findByTestCompletedTrue();
    
    List<PersonProfile> findByTestTrue();
    
    List<PersonProfile> findByTestFalse();
    
    List<PersonProfile> findByTestCompletedTrueAndTestTrue();
    
    List<PersonProfile> findByTestCompletedTrueAndTestFalse();
}
